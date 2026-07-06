import type { Player } from "../types";

export const INITIAL_PLAYER: Player = {
  id: "player",
  name: "你",
  age: 25,
  gender: "男",
  role: "乐队经理",
  avatar: "你",
  bio: "热爱音乐的年轻人,梦想打造一支传奇乐队。你不仅负责乐队的日常运营,也是乐队的灵魂人物。",
  appearance: "中等身材,留着干净利落的短发,眼神中透着对音乐的热爱和执着。穿着简单的黑色T恤和牛仔裤,随身携带一个笔记本记录灵感。",
  personality: "热情、果断、善于沟通,有时候会过于理想化。对音乐有独特的品味,相信好的音乐能够改变世界。",
  skills: [
    { id: "p1", name: "乐队管理", level: 65, description: "协调乐队成员和日常事务" },
    { id: "p2", name: "音乐鉴赏", level: 78, description: "对音乐风格和质量有敏锐的判断力" },
    { id: "p3", name: "人际关系", level: 72, description: "与人沟通和建立关系的能力" },
    { id: "p4", name: "商业谈判", level: 55, description: "与演出场地和赞助商谈判" },
    { id: "p5", name: "财务管理", level: 48, description: "管理乐队资金和预算" },
  ],
  mood: 70,
};
