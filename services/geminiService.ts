
import { GoogleGenAI, Type } from "@google/genai";
import { PracticeSettings, PracticeMenu, Drill } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePracticeMenu = async (settings: PracticeSettings, userDrills: Drill[] = []): Promise<PracticeMenu> => {
  if (userDrills.length === 0) {
    throw new Error("ライブラリにドリルが登録されていません。まずは「ドリル管理」から練習内容を登録してください。");
  }

  const drillsContext = `
    【重要ルール】
    必ず以下の「提供ドリルリスト」の中からのみドリルを選択してメニューを構成してください。
    リストにない練習内容やドリル名は一切含めないでください。
    
    提供ドリルリスト:
    ${JSON.stringify(userDrills.map(d => ({ 
      name: d.name, 
      description: d.description, 
      keyPoints: d.keyPoints, 
      category: d.category,
      level: d.level,
      duration: d.duration 
    })))}
  `;

  const prompt = `
    バドミントンの練習メニューを作成してください。
    以下の条件に基づいています：
    - 対象レベル (複数可): ${settings.levels.join('、')}
    - 参加人数: ${settings.players}人
    - 合計練習時間: ${settings.duration}分
    - 重点項目 (複数可): ${settings.focusAreas.join('、')}

    ${drillsContext}

    【構成指示】
    1. 提供されたドリルリストの中から、条件（レベル・重点項目）に合うものをバランスよく選択してください。複数の重点項目が指定されている場合、それらを網羅するようにしてください。
    2. 合計時間が正確に${settings.duration}分になるよう、各ドリルの実施時間を調整してください（元の推奨時間を参考に増減させてください）。
    3. ドリルリストが少ない場合は、同じドリルを複数回組み込んでも構いませんが、新しいドリルを勝手に創作しないでください。
    4. 練習の流れ（アップ→基礎→課題→ゲーム等）が自然になるように並び替えてください。
    5. 各ドリルの意識すべきポイント（keyPoints）は、提供されたリストの内容を基に記載してください。
    
    出力は日本語で、指定されたJSONスキーマに従ってください。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          level: { type: Type.STRING },
          totalDuration: { type: Type.NUMBER },
          intensityScore: { type: Type.NUMBER, description: "1 (Low) to 10 (High)" },
          drills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                description: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                category: { type: Type.STRING }
              },
              required: ["name", "duration", "description", "keyPoints"]
            }
          },
          coachingAdvice: { type: Type.STRING },
          intensityDistribution: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              },
              required: ["category", "percentage"]
            }
          }
        },
        required: ["title", "level", "totalDuration", "intensityScore", "drills", "coachingAdvice", "intensityDistribution"]
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text) as PracticeMenu;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("練習メニューの自動生成に失敗しました。ライブラリのドリルが少なすぎるか、形式が正しくない可能性があります。");
  }
};
