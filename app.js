(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.YuedongPlanet = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "yuedongPlanetState";

  const TASKS = {
    microStep: {
      id: "microStep",
      name: "原地踏步",
      type: "微任务",
      minutes: 3,
      difficulty: "轻",
      description: "在宿舍或走廊原地踏步，让身体先进入启动状态。",
      reward: { xp: 10, energy: 10, buildValue: 5 },
      area: "dorm",
      badge: "threeMinuteHero",
    },
    walk: {
      id: "walk",
      name: "操场快走",
      type: "日常任务",
      minutes: 10,
      difficulty: "中",
      description: "去操场或校园主路快走一圈，保持能说话但略喘的节奏。",
      reward: { xp: 20, energy: 20, buildValue: 10 },
      area: "track",
      badge: "trackLighter",
    },
    stretch: {
      id: "stretch",
      name: "肩颈拉伸",
      type: "恢复任务",
      minutes: 5,
      difficulty: "轻",
      description: "离开座位，做一组肩颈和背部拉伸。",
      reward: { xp: 15, energy: 10, buildValue: 5 },
      area: "library",
      badge: "libraryGuardian",
    },
    lakeWalk: {
      id: "lakeWalk",
      name: "湖边散步",
      type: "散步任务",
      minutes: 15,
      difficulty: "轻",
      description: "沿湖边或校园绿道慢走，给大脑换一段风景。",
      reward: { xp: 20, energy: 20, buildValue: 10 },
      area: "lake",
      badge: "lakeRover",
    },
    ballGame: {
      id: "ballGame",
      name: "羽毛球 / 篮球",
      type: "球类任务",
      minutes: 20,
      difficulty: "高",
      description: "约同学打一场轻量球类运动，重点是动起来。",
      reward: { xp: 30, energy: 20, buildValue: 30 },
      area: "gym",
      badge: "gymSmith",
    },
  };

  const AREAS = {
    dorm: {
      id: "dorm",
      name: "宿舍营地",
      condition: "完成 3 分钟启动",
      visual: "从灰色变亮",
    },
    track: {
      id: "track",
      name: "操场荒原",
      condition: "完成快走或跑步",
      visual: "显示旗帜",
    },
    library: {
      id: "library",
      name: "图书馆秘境",
      condition: "完成拉伸任务",
      visual: "显示光点",
    },
    gym: {
      id: "gym",
      name: "体育馆堡垒",
      condition: "完成球类或健身",
      visual: "显示建筑",
    },
    lake: {
      id: "lake",
      name: "湖畔森林",
      condition: "完成散步任务",
      visual: "显示路线",
    },
  };

  const BADGES = {
    firstMove: { id: "firstMove", name: "初醒拓荒者", condition: "完成第一次运动" },
    threeMinuteHero: { id: "threeMinuteHero", name: "三分钟勇者", condition: "完成一次 3 分钟启动" },
    trackLighter: { id: "trackLighter", name: "操场点灯人", condition: "点亮操场荒原" },
    libraryGuardian: { id: "libraryGuardian", name: "图书馆守护者", condition: "完成拉伸任务" },
    gymSmith: { id: "gymSmith", name: "体育馆锻造师", condition: "完成球类或健身任务" },
    lakeRover: { id: "lakeRover", name: "湖畔漫游者", condition: "完成散步任务" },
    starAlly: { id: "starAlly", name: "星盟协作者", condition: "发送一次加油光点" },
    weeklyActive: { id: "weeklyActive", name: "本周活跃者", condition: "本周完成 3 次运动" },
    restartHero: { id: "restartHero", name: "重启勇者", condition: "低压力重启一次" },
    campusExplorer: { id: "campusExplorer", name: "校园探索者", condition: "点亮 3 个校园区域" },
    flagBearer: { id: "flagBearer", name: "区域旗手", condition: "完成一次区域插旗" },
  };

  const FOCUS_TASKS = [
    "原地踏步 90 秒",
    "下楼走到门口再回来",
    "做 6 次深呼吸和肩颈拉伸",
    "靠墙静蹲 20 秒",
    "绕宿舍楼走一圈",
  ];

  const ACADEMY_RANKING = [
    { name: "信息学院", score: 860, basePerCapitaEnergy: 81 },
    { name: "经管学院", score: 790, basePerCapitaEnergy: 78 },
    { name: "物理学院", score: 735, basePerCapitaEnergy: 75 },
    { name: "文学院", score: 680, basePerCapitaEnergy: 72 },
  ];

  const AREA_CONTESTS = {
    dorm: { id: "dorm", opponent: "信息学院", initialControl: 54 },
    track: { id: "track", opponent: "经管学院", initialControl: 48 },
    library: { id: "library", opponent: "文学院", initialControl: 51 },
    gym: { id: "gym", opponent: "信息学院", initialControl: 44 },
    lake: { id: "lake", opponent: "经管学院", initialControl: 46 },
  };

  const ENERGY_MODES = {
    low: {
      id: "low",
      label: "低能量",
      taskId: "microStep",
      focusTaskIndex: 0,
      message: "已切换到低能量模式，今天先完成一个很小的启动。",
    },
    normal: {
      id: "normal",
      label: "常规",
      taskId: "walk",
      focusTaskIndex: 1,
      message: "已切换到常规模式，适合完成一次校园快走。",
    },
    high: {
      id: "high",
      label: "想挑战",
      taskId: "ballGame",
      focusTaskIndex: 4,
      message: "已切换到挑战模式，今天可以把运动贡献给体育馆堡垒。",
    },
  };

  const QUESTS = [
    {
      id: "start",
      name: "启动星火",
      requirement: "完成任意一次启动",
      nextAction: "先完成一次 3 分钟启动",
      reward: { xp: 15, energy: 10 },
      isComplete: (state) => state.totalWorkouts > 0,
    },
    {
      id: "explore",
      name: "双区探索",
      requirement: "点亮 2 个校园区域",
      nextAction: "再完成一个不同类型的任务",
      reward: { xp: 20, buildValue: 10 },
      isComplete: (state) => state.unlockedAreas.length >= 2,
    },
    {
      id: "social",
      name: "星盟接入",
      requirement: "完成一次公会、Boss 或加油互动",
      nextAction: "把运动成果贡献给星盟",
      reward: { xp: 15, bondValue: 5 },
      isComplete: (state) => state.guildContribution >= 20 || state.bossDamage > 0 || state.bondValue > 0,
    },
    {
      id: "flag",
      name: "区域插旗",
      requirement: "完成一次校园区域插旗",
      nextAction: "为当前任务区域插旗",
      reward: { xp: 15, academyEnergy: 10 },
      isComplete: (state) => state.flagCount > 0,
    },
    {
      id: "academy",
      name: "学院供能",
      requirement: "为学院贡献一次源力",
      nextAction: "为所选学院贡献源力",
      reward: { xp: 20, energy: 20 },
      isComplete: (state) => state.academyEnergy > 0,
    },
  ];

  const RESOURCE_COSTS = {
    // 插旗消耗：每次插旗消耗源力
    plantFlag: {
      energyCost: 15,
      controlGain: 12,
      xpReward: 5,
      honorEnergy: 8,
      footprintGain: 12,
      maxDailyPerArea: 3,
    },
    // 攻击Boss消耗：每次攻击消耗XP和源力
    attackBoss: {
      xpCost: 10,
      energyCost: 15,
      baseDamage: 30,
      xpReward: 3,
      energyReward: 3,
    },
    // 学院贡献消耗：直接消耗源力
    contributeAcademy: {
      energyCost: 25,
      academyEnergyGain: 20,
      xpReward: 5,
    },
    // 公会升级阈值
    guildLevels: [
      { level: 1, buildRequired: 0, bonusPercent: 0 },
      { level: 2, buildRequired: 100, bonusPercent: 5 },
      { level: 3, buildRequired: 200, bonusPercent: 10 },
      { level: 4, buildRequired: 300, bonusPercent: 15 },
    ],
  };

  const MODAL_CONTENT = {
    overview: {
      kicker: "作品说明",
      title: "提交版演示导览",
      paragraphs: [
        "跃动星球是一款面向大学生的游戏化运动激励工具，把现实运动转化为源力、建造值和荣耀积分。",
        "产品重点解决运动难启动、反馈弱、缺少陪伴和中断后放弃的问题。建议评审按三分钟启动 -> 今日冒险线 -> 地图点亮 -> 区域插旗 -> 公会建设 -> 学院圣杯 -> 周报的顺序体验。",
      ],
      points: ["核心机制：三分钟启动、Focus Move、校园地图、公会浮空岛、足迹占领、学院圣杯。", "社交原则：强调协作、匿名鼓励和集体荣誉，避免公开羞辱式打卡。", "实现边界：不接入真实定位、真实健康数据或医疗诊断。"],
    },
    starter: {
      kicker: "核心入口",
      title: "为什么是三分钟启动舱",
      paragraphs: [
        "很多用户卡住的不是不会运动，而是迟迟无法开始。三分钟启动舱把目标压到足够小，让用户先获得一次成功体验。",
        "完成后立即发放 XP、源力、建造值、地图点亮和徽章奖励，强化「启动也算进步」的产品主张。",
      ],
      points: ["开始门槛低，适合宿舍、走廊等校园场景。", "倒计时可暂停和重置，减少被打断后的挫败感。", "演示完成按钮用于答辩时快速展示奖励闭环。"],
    },
    focus: {
      kicker: "ADHD 友好",
      title: "Focus Move 的设计边界",
      paragraphs: [
        "Focus Move 面向注意力分散、拖延、低能量或 ADHD 倾向用户，但不做医疗诊断。它只提供更友好的执行支持。",
        "这里把复杂运动拆成轻任务，并允许中断后低压力重启，避免传统连续打卡带来的失败感。",
      ],
      points: ["减少选择负担：用户可以直接换一个更轻任务。", "任务步骤短：站起来、开始、记录，降低执行成本。", "文案保持正向，不使用失败、偷懒、断签等刺激性表达。"],
    },
    journey: {
      kicker: "成长路线",
      title: "今日冒险线如何增加深度",
      paragraphs: [
        "冒险线把零散按钮组织成阶段目标：先启动，再探索区域，然后参与社交共建，最后把源力贡献给学院。",
        "它让用户知道当前进度和下一步行动，也让评审能看到产品具备持续循环，而不是一次性点击演示。",
      ],
      points: ["阶段完成后可以领取额外奖励，强化目标感。", "状态适配任务会根据低能量、常规或挑战状态切换推荐任务。", "冒险线不依赖后端，仍然适合静态部署。"],
    },
    flag: {
      kicker: "区域竞争",
      title: "区域插旗赛的作用",
      paragraphs: [
        "区域插旗赛把校园地图从静态点亮升级为动态争夺。用户完成任务后，可以为当前任务对应区域插下所选学院旗帜，提升该学院控制率。",
        "这个模块把个人运动、地图探索和学院竞争串起来，让用户看到自己的运动不只是个人数据，也会影响校园区域归属。",
      ],
      points: ["每次插旗提升当前区域控制率，并获得 XP 与学院源力。", "控制率达到领先会在区域卡片中显示优势状态。", "这是模拟竞赛数据，不涉及真实定位或真实学院人数。"],
    },
    social: {
      kicker: "社交激励",
      title: "为什么选择轻社交共建",
      paragraphs: [
        "第一版不做真实好友和公开惩罚排行榜，而是把个人运动转化为公会建设、Boss 伤害、匿名加油和学院贡献。",
        "这种设计能展示社交激励，又不会让未完成任务的用户被公开比较或羞辱。",
      ],
      points: ["公会浮空岛：把建造值贡献给团队。", "公会 Boss：用血条变化展示集体目标。", "拓荒信号：只做匿名鼓励，不获取真实位置。"],
    },
    report: {
      kicker: "阶段反馈",
      title: "周报如何促进复访",
      paragraphs: [
        "周报把零散运动整理成阶段成果，帮助用户看到本周已经完成了什么，而不是只盯着今天是否完美。",
        "它同时汇总个人成长和团队贡献，让用户形成下一周继续运动的理由。",
      ],
      points: ["本周运动次数和分钟体现基础行为。", "地图区域和徽章体现成就积累。", "公会与学院贡献体现社交价值。"],
    },
  };

  function createDefaultState() {
    return {
      xp: 0,
      level: 1,
      energy: 0,
      buildValue: 0,
      bondValue: 0,
      totalWorkouts: 0,
      weeklyWorkouts: 0,
      weeklyMinutes: 0,
      unlockedAreas: [],
      unlockedBadges: [],
      guildContribution: 0,
      guildBuild: 0,
      guildLevel: 1,
      guildBonusPercent: 0,
      guildBuildingName: "星能补给站 Lv.1",
      selectedAcademy: "信息学院",
      academyContributions: {},
      academyEnergy: 0,
      academyCupRank: 3,
      honorRewardClaimed: false,
      claimedAcademyHonors: [],
      bossHp: 620,
      bossDamage: 0,
      currentTaskId: "walk",
      focusTaskIndex: 0,
      energyMode: "normal",
      claimedQuestRewards: [],
      areaControl: Object.fromEntries(Object.values(AREA_CONTESTS).map((area) => [area.id, area.initialControl])),
      areaFootprints: Object.fromEntries(Object.values(AREA_CONTESTS).map((area) => [area.id, 0])),
      controlledAreas: [],
      nextDayAreaBonus: 0,
      settlementCount: 0,
      flagCount: 0,
      lastMessage: "今天不需要完美运动，先启动就算赢。",
      lastEvent: null,
    };
  }

  function getLevel(xp) {
    return Math.floor(xp / 100) + 1;
  }

  function cloneState(state) {
    return {
      ...createDefaultState(),
      ...state,
      unlockedAreas: [...(state.unlockedAreas || [])],
      unlockedBadges: [...(state.unlockedBadges || [])],
      claimedQuestRewards: [...(state.claimedQuestRewards || [])],
      controlledAreas: [...(state.controlledAreas || [])],
      claimedAcademyHonors: [...(state.claimedAcademyHonors || [])],
      academyContributions: { ...(state.academyContributions || {}) },
      lastEvent: state.lastEvent ? { ...state.lastEvent, points: [...(state.lastEvent.points || [])] } : null,
      areaControl: {
        ...Object.fromEntries(Object.values(AREA_CONTESTS).map((area) => [area.id, area.initialControl])),
        ...(state.areaControl || {}),
      },
      areaFootprints: {
        ...Object.fromEntries(Object.values(AREA_CONTESTS).map((area) => [area.id, 0])),
        ...(state.areaFootprints || {}),
      },
    };
  }

  function addUnique(list, value) {
    return list.includes(value) ? list : [...list, value];
  }

  function getGuildBonusPercent(guildLevel) {
    return Math.min(25, Math.max(0, (guildLevel - 1) * 5));
  }

  function getGuildBuildingName(guildLevel) {
    return `星能补给站 Lv.${guildLevel}`;
  }

  function createEvent(kicker, title, paragraphs, points) {
    return {
      kicker,
      title,
      paragraphs: Array.isArray(paragraphs) ? paragraphs : [paragraphs],
      points: points.filter(Boolean),
    };
  }

  function formatRewardPoints(reward) {
    return [
      reward.xp ? `XP +${reward.xp}` : "",
      reward.energy ? `源力 +${reward.energy}` : "",
      reward.buildValue ? `建造值 +${reward.buildValue}` : "",
      reward.bondValue ? `羁绊值 +${reward.bondValue}` : "",
      reward.academyEnergy ? `荣耀源力 +${reward.academyEnergy}` : "",
    ].filter(Boolean);
  }

  function calculateAcademyRanking(state) {
    return ACADEMY_RANKING.map((item) => {
      const extraEnergy = state.academyContributions[item.name] || 0;
      const perCapitaEnergy = item.basePerCapitaEnergy + Math.round(extraEnergy / 10);
      return {
        ...item,
        score: item.score + extraEnergy,
        perCapitaEnergy,
        isMine: item.name === state.selectedAcademy,
      };
    }).sort((a, b) => b.perCapitaEnergy - a.perCapitaEnergy || b.score - a.score);
  }

  function finalizeState(state) {
    const next = cloneState(state);
    next.level = getLevel(next.xp);

    if (next.totalWorkouts > 0) {
      next.unlockedBadges = addUnique(next.unlockedBadges, "firstMove");
    }

    if (next.weeklyWorkouts >= 3) {
      next.unlockedBadges = addUnique(next.unlockedBadges, "weeklyActive");
    }

    if (next.unlockedAreas.length >= 3) {
      next.unlockedBadges = addUnique(next.unlockedBadges, "campusExplorer");
    }

    if (next.flagCount > 0) {
      next.unlockedBadges = addUnique(next.unlockedBadges, "flagBearer");
    }

    next.guildLevel = Math.floor(next.guildBuild / 100) + 1;
    next.guildBonusPercent = getGuildBonusPercent(next.guildLevel);
    next.guildBuildingName = getGuildBuildingName(next.guildLevel);
    next.honorRewardClaimed = next.claimedAcademyHonors.includes(next.selectedAcademy);
    next.academyCupRank = calculateAcademyRanking(next).findIndex((item) => item.name === next.selectedAcademy) + 1;
    return next;
  }

  function applyWorkoutReward(state, task) {
    const next = cloneState(state);
    const guildBonusXp = Math.round(task.reward.xp * (next.guildBonusPercent || 0) / 100);
    const guildBonusEnergy = Math.round(task.reward.energy * (next.guildBonusPercent || 0) / 100);
    const areaBonusEnergy = Math.round(task.reward.energy * (next.nextDayAreaBonus || 0) / 100);
    next.xp += task.reward.xp + guildBonusXp;
    next.energy += task.reward.energy + guildBonusEnergy + areaBonusEnergy;
    next.buildValue += task.reward.buildValue;
    next.totalWorkouts += 1;
    next.weeklyWorkouts += 1;
    next.weeklyMinutes += task.minutes;
    next.unlockedAreas = addUnique(next.unlockedAreas, task.area);
    next.unlockedBadges = addUnique(next.unlockedBadges, task.badge);
    next.lastMessage = `${task.name}完成，${AREAS[task.area].name}被点亮了一点。`;
    if (next.guildBonusPercent > 0) {
      next.lastMessage += `公会建筑提供 ${next.guildBonusPercent}% 收益加成。`;
    }
    if (next.nextDayAreaBonus > 0) {
      next.lastMessage += `次日区域加成提供 ${next.nextDayAreaBonus}% 源力加成。`;
    }
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "运动反馈",
      "任务完成",
      `${task.name}完成，${AREAS[task.area].name}被点亮。`,
      [
        `XP +${task.reward.xp + guildBonusXp}`,
        `源力 +${task.reward.energy + guildBonusEnergy + areaBonusEnergy}`,
        `建造值 +${task.reward.buildValue}`,
        `点亮区域：${AREAS[task.area].name}`,
        guildBonusXp || guildBonusEnergy ? `公会建筑加成：${next.guildBonusPercent}%` : "",
        areaBonusEnergy ? `次日区域加成：${next.nextDayAreaBonus}%` : "",
      ]
    );
    return finalized;
  }

  function completeStarter(state) {
    const task = {
      ...TASKS.microStep,
      reward: { xp: 10, energy: 10, buildValue: 5 },
      minutes: 3,
    };
    const next = applyWorkoutReward(state, task);
    next.guildContribution += 5;
    next.guildBuild += 5;
    next.unlockedBadges = addUnique(next.unlockedBadges, "threeMinuteHero");
    next.lastMessage = "三分钟启动完成，宿舍营地已点亮。";
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "启动反馈",
      "三分钟启动完成",
      "你已经完成今天最重要的一步：先动起来。",
      ["XP +10", "源力 +10", "建造值 +5", "点亮区域：宿舍营地", "解锁徽章：三分钟勇者"]
    );
    return finalized;
  }

  function completeTask(state, taskId) {
    const task = TASKS[taskId];
    if (!task) {
      return finalizeState(state);
    }
    return applyWorkoutReward(state, task);
  }

  function getCurrentTaskArea(state) {
    const task = TASKS[state.currentTaskId] || TASKS.walk;
    return task.area;
  }

  function getControlStatus(control) {
    if (control >= 55) return "领先";
    if (control <= 45) return "落后";
    return "争夺";
  }

  function canAffordCost(state, xpCost, energyCost) {
    return (state.xp >= (xpCost || 0)) && (state.energy >= (energyCost || 0));
  }

  function isKnownAcademy(academyName) {
    return ACADEMY_RANKING.some((academy) => academy.name === academyName);
  }

  function setSelectedAcademy(state, academyName) {
    if (!isKnownAcademy(academyName)) {
      return finalizeState(state);
    }

    const next = cloneState(state);
    next.selectedAcademy = academyName;
    next.lastMessage = `已加入${academyName}阵营，后续源力和插旗都会计入该学院。`;
    return finalizeState(next);
  }

  function plantFlag(state, areaId) {
    const next = cloneState(state);
    const targetAreaId = AREA_CONTESTS[areaId] ? areaId : getCurrentTaskArea(next);
    const cost = RESOURCE_COSTS.plantFlag;

    // 检查是否有足够的源力
    if (!canAffordCost(next, 0, cost.energyCost)) {
      next.lastMessage = `源力不足！插旗需要 ${cost.energyCost} 源力，当前只有 ${next.energy} 源力。先完成一些运动任务来获取源力吧。`;
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "资源不足",
        "无法插旗",
        "你的源力不足以在当前区域插旗。",
        [`需要源力：${cost.energyCost}`, `当前源力：${next.energy}`, "提示：完成运动任务可获得源力"]
      );
      return finalized;
    }

    const currentControl = next.areaControl[targetAreaId] ?? AREA_CONTESTS[targetAreaId].initialControl;
    const nextControl = Math.min(100, currentControl + cost.controlGain);

    // 扣除源力，获得奖励
    next.energy -= cost.energyCost;
    next.areaControl[targetAreaId] = nextControl;
    next.areaFootprints[targetAreaId] = (next.areaFootprints[targetAreaId] || 0) + cost.footprintGain;
    next.flagCount += 1;
    next.academyEnergy += cost.honorEnergy;
    next.academyContributions[next.selectedAcademy] = (next.academyContributions[next.selectedAcademy] || 0) + cost.honorEnergy;
    next.xp += cost.xpReward;
    next.lastMessage = `已在${AREAS[targetAreaId].name}插下${next.selectedAcademy}旗帜，消耗 ${cost.energyCost} 源力，区域控制率提升至 ${nextControl}%。`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "区域反馈",
      "插旗成功",
      `消耗 ${cost.energyCost} 源力在${AREAS[targetAreaId].name}插旗成功。`,
      [`源力消耗：-${cost.energyCost}`, `XP +${cost.xpReward}`, `荣耀源力 +${cost.honorEnergy}`, `区域控制率：${nextControl}%`, `区域足迹 +${cost.footprintGain}`, "解锁徽章：区域旗手"]
    );
    return finalized;
  }

  function getFlagWar(state) {
    const next = finalizeState(state);
    const currentArea = getCurrentTaskArea(next);

    return Object.values(AREA_CONTESTS).map((contest) => {
      const control = next.areaControl[contest.id] ?? contest.initialControl;
      const opponent = contest.opponent === next.selectedAcademy
        ? ACADEMY_RANKING.find((academy) => academy.name !== next.selectedAcademy).name
        : contest.opponent;
      return {
        ...contest,
        name: AREAS[contest.id].name,
        control,
        footprints: next.areaFootprints[contest.id] || 0,
        opponentControl: 100 - control,
        opponent,
        status: getControlStatus(control),
        isCurrent: contest.id === currentArea,
        isControlled: next.controlledAreas.includes(contest.id),
      };
    });
  }

  function settleAreaControl(state) {
    const next = cloneState(state);
    const controlledAreas = Object.values(AREA_CONTESTS)
      .filter((contest) => (next.areaControl[contest.id] || contest.initialControl) >= 55)
      .map((contest) => contest.id);

    next.controlledAreas = controlledAreas;
    next.nextDayAreaBonus = controlledAreas.length * 8;
    next.areaFootprints = Object.fromEntries(Object.values(AREA_CONTESTS).map((area) => [area.id, 0]));
    next.settlementCount += 1;
    next.lastMessage = `晚间结算完成，${next.selectedAcademy}控制 ${controlledAreas.length} 个区域，次日区域加成为 ${next.nextDayAreaBonus}%。`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "结算反馈",
      "晚间结算完成",
      `${next.selectedAcademy}获得 ${controlledAreas.length} 个区域控制权。`,
      [
        `控制区域：${controlledAreas.length ? controlledAreas.map((id) => AREAS[id].name).join(" / ") : "暂无"}`,
        `次日区域加成：${next.nextDayAreaBonus}%`,
        "区域足迹已进入下一轮",
      ]
    );
    return finalized;
  }

  function contributeGuild(state) {
    const next = cloneState(state);

    // 检查是否有建造值可以贡献
    if (next.buildValue <= 0) {
      next.lastMessage = "建造值不足！先完成运动任务来获得建造值。";
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "资源不足",
        "无法贡献公会",
        "你当前没有可贡献的建造值。",
        ["当前建造值：0", "提示：完成运动任务可获得建造值"]
      );
      return finalized;
    }

    const before = finalizeState(next);
    // 贡献当前所有的建造值（或者可以设置上限）
    const contribution = Math.min(next.buildValue, 50); // 最多贡献 50
    next.buildValue -= contribution;
    next.guildBuild += contribution;
    next.guildContribution += contribution;
    next.lastMessage = `为 404 宿舍拓荒团贡献了 ${contribution} 建造值。`;
    const finalized = finalizeState(next);
    const upgraded = finalized.guildLevel > before.guildLevel;
    finalized.lastEvent = createEvent(
      "公会反馈",
      upgraded ? "建筑升级！" : "公会贡献完成",
      upgraded ? `恭喜！${finalized.guildBuildingName}完成升级，全员收益加成提高。` : `你的 ${contribution} 建造值已转化为公会建设进度。`,
      [
        `建造值消耗：-${contribution}`,
        `剩余建造值：${finalized.buildValue}`,
        `建设进度：${finalized.guildBuild} / 300`,
        upgraded ? `建筑等级：Lv.${finalized.guildLevel} ← 升级！` : "",
        `全员收益加成：${finalized.guildBonusPercent}%`,
      ].filter(Boolean)
    );
    return finalized;
  }

  function attackBoss(state) {
    const next = cloneState(state);
    const cost = RESOURCE_COSTS.attackBoss;

    // 检查是否有足够的 XP 和源力
    if (!canAffordCost(next, cost.xpCost, cost.energyCost)) {
      next.lastMessage = `资源不足！攻击 Boss 需要 ${cost.xpCost} XP 和 ${cost.energyCost} 源力。`;
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "资源不足",
        "无法攻击 Boss",
        "你的资源不足以对 Boss 造成伤害。",
        [`需要 XP：${cost.xpCost}（当前：${next.xp}）`, `需要源力：${cost.energyCost}（当前：${next.energy}）`, "提示：完成运动任务可获得资源"]
      );
      return finalized;
    }

    // 扣除资源，造成伤害
    next.xp -= cost.xpCost;
    next.energy -= cost.energyCost;
    const damage = cost.baseDamage + Math.round(cost.xpCost * 0.2); // 基础伤害 + XP 加成
    next.bossHp = Math.max(0, next.bossHp - damage);
    next.bossDamage += damage;
    next.xp += cost.xpReward;
    next.energy += cost.energyReward;
    next.lastMessage = `消耗 ${cost.xpCost} XP 和 ${cost.energyCost} 源力，对虚空巨兽造成 ${damage} 点伤害！`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "公会战反馈",
      "Boss 受到伤害",
      `你的资源已被转化为 ${damage} 点 Boss 伤害。`,
      [
        `XP 消耗：-${cost.xpCost}`,
        `源力消耗：-${cost.energyCost}`,
        `Boss 伤害：+${damage}`,
        `XP 返还：+${cost.xpReward}`,
        `源力返还：+${cost.energyReward}`,
        `Boss 剩余血量：${finalized.bossHp} / 620`
      ]
    );
    return finalized;
  }

  function sendCheer(state) {
    const next = cloneState(state);
    next.bondValue += 5;
    next.xp += 5;
    next.unlockedBadges = addUnique(next.unlockedBadges, "starAlly");
    next.lastMessage = "你向附近运动者发送了一束匿名加油光点。";
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "社交反馈",
      "加油光点已发送",
      "一束匿名鼓励已经送到附近运动者那里。",
      ["羁绊值 +5", "XP +5", "解锁徽章：星盟协作者"]
    );
    return finalized;
  }

  function contributeAcademy(state) {
    const next = cloneState(state);
    const cost = RESOURCE_COSTS.contributeAcademy;

    // 检查是否有足够的源力
    if (!canAffordCost(next, 0, cost.energyCost)) {
      next.lastMessage = `源力不足！为学院贡献需要 ${cost.energyCost} 源力。`;
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "资源不足",
        "无法贡献学院",
        "你的源力不足以贡献给学院。",
        [`需要源力：${cost.energyCost}`, `当前源力：${next.energy}`, "提示：完成运动任务可获得源力"]
      );
      return finalized;
    }

    // 扣除源力，贡献给学院
    next.energy -= cost.energyCost;
    next.academyEnergy += cost.academyEnergyGain;
    next.academyContributions[next.selectedAcademy] = (next.academyContributions[next.selectedAcademy] || 0) + cost.academyEnergyGain;
    next.xp += cost.xpReward;
    next.lastMessage = `消耗 ${cost.energyCost} 源力，为${next.selectedAcademy}贡献了 ${cost.academyEnergyGain} 荣耀源力！`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "学院反馈",
      "荣耀源力已贡献",
      `你的源力已转化为${next.selectedAcademy}的荣耀源力。`,
      [
        `源力消耗：-${cost.energyCost}`,
        `荣耀源力：+${cost.academyEnergyGain}`,
        `XP +${cost.xpReward}`,
        `当前圣杯排名：第 ${finalized.academyCupRank} 名`
      ]
    );
    return finalized;
  }

  function getAcademyRanking(state) {
    return calculateAcademyRanking(finalizeState(state));
  }

  function claimAcademyHonor(state) {
    const next = finalizeState(state);

    if (next.honorRewardClaimed) {
      next.lastMessage = "学院圣杯奖励已经领取过了。";
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "学院反馈",
        "奖励已领取过",
        "该学院阵营的圣杯奖励已经记录，无需重复领取。",
        [`当前阵营：${next.selectedAcademy}`, `当前排名：第 ${finalized.academyCupRank} 名`]
      );
      return finalized;
    }

    const reward = next.academyCupRank === 1 ? 30 : next.academyCupRank === 2 ? 20 : 10;
    next.xp += reward;
    next.energy += reward;
    next.claimedAcademyHonors = addUnique(next.claimedAcademyHonors, next.selectedAcademy);
    next.honorRewardClaimed = true;
    next.lastMessage = `学院圣杯第 ${next.academyCupRank} 名奖励已领取，全员获得 XP +${reward} / 源力 +${reward}。`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "学院反馈",
      "圣杯奖励已领取",
      `${next.selectedAcademy}当前圣杯排名第 ${next.academyCupRank} 名。`,
      [`XP +${reward}`, `源力 +${reward}`, "集体荣誉奖励已记录"]
    );
    return finalized;
  }

  function restartFocusMove(state) {
    const next = cloneState(state);
    next.xp += 15;
    next.energy += 10;
    next.unlockedBadges = addUnique(next.unlockedBadges, "restartHero");
    next.lastMessage = "低压力重启完成，节奏已经重新接上。";
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "Focus Move",
      "低压力重启完成",
      "中断后重新开始也算一次有效进展。",
      ["XP +15", "源力 +10", "解锁徽章：重启勇者"]
    );
    return finalized;
  }

  function setCurrentTask(state, taskId) {
    const next = cloneState(state);
    next.currentTaskId = TASKS[taskId] ? taskId : next.currentTaskId;
    next.lastMessage = `今日任务已切换为：${TASKS[next.currentTaskId].name}`;
    return finalizeState(next);
  }

  function nextRandomTask(state) {
    const ids = Object.keys(TASKS).filter((id) => id !== "microStep");
    const currentIndex = ids.indexOf(state.currentTaskId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % ids.length : 0;
    return setCurrentTask(state, ids[nextIndex]);
  }

  function nextFocusTask(state) {
    const next = cloneState(state);
    next.focusTaskIndex = (next.focusTaskIndex + 1) % FOCUS_TASKS.length;
    next.lastMessage = "已换成一个更轻的启动任务。";
    return finalizeState(next);
  }

  function setEnergyMode(state, modeId) {
    const mode = ENERGY_MODES[modeId];
    if (!mode) {
      return finalizeState(state);
    }

    const next = cloneState(state);
    next.energyMode = mode.id;
    next.currentTaskId = mode.taskId;
    next.focusTaskIndex = mode.focusTaskIndex;
    next.lastMessage = mode.message;
    return finalizeState(next);
  }

  function getQuestProgress(state) {
    const next = finalizeState(state);
    return QUESTS.map((quest) => ({
      id: quest.id,
      name: quest.name,
      requirement: quest.requirement,
      nextAction: quest.nextAction,
      reward: quest.reward,
      complete: quest.isComplete(next),
      claimed: next.claimedQuestRewards.includes(quest.id),
    }));
  }

  function addReward(next, reward) {
    next.xp += reward.xp || 0;
    next.energy += reward.energy || 0;
    next.buildValue += reward.buildValue || 0;
    next.bondValue += reward.bondValue || 0;
    next.academyEnergy += reward.academyEnergy || 0;
  }

  function claimNextQuestReward(state) {
    const next = cloneState(state);
    const quest = QUESTS.find((item) => item.isComplete(next) && !next.claimedQuestRewards.includes(item.id));

    if (!quest) {
      next.lastMessage = "今日冒险线暂无可领取奖励。";
      const finalized = finalizeState(next);
      finalized.lastEvent = createEvent(
        "冒险线反馈",
        "暂无可领取奖励",
        "继续完成下一阶段目标后，就可以领取新的阶段奖励。",
        ["查看今日冒险线中的下一步提示"]
      );
      return finalized;
    }

    addReward(next, quest.reward);
    next.claimedQuestRewards = addUnique(next.claimedQuestRewards, quest.id);
    next.lastMessage = `${quest.name}阶段奖励已领取。`;
    const finalized = finalizeState(next);
    finalized.lastEvent = createEvent(
      "冒险线反馈",
      "阶段奖励已领取",
      `${quest.name}阶段已经完成，奖励已加入你的账户。`,
      formatRewardPoints(quest.reward)
    );
    return finalized;
  }

  function loadState() {
    if (typeof localStorage === "undefined") {
      return createDefaultState();
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? finalizeState(JSON.parse(saved)) : createDefaultState();
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState(state) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalizeState(state)));
    }
  }

  function resetState() {
    const state = createDefaultState();
    saveState(state);
    return state;
  }

  const api = {
    STORAGE_KEY,
    TASKS,
    AREAS,
    BADGES,
    FOCUS_TASKS,
    ACADEMY_RANKING,
    AREA_CONTESTS,
    ENERGY_MODES,
    QUESTS,
    MODAL_CONTENT,
    createDefaultState,
    getLevel,
    completeStarter,
    completeTask,
    setSelectedAcademy,
    plantFlag,
    getFlagWar,
    settleAreaControl,
    contributeGuild,
    attackBoss,
    sendCheer,
    contributeAcademy,
    getAcademyRanking,
    claimAcademyHonor,
    restartFocusMove,
    setCurrentTask,
    nextRandomTask,
    nextFocusTask,
    setEnergyMode,
    getQuestProgress,
    claimNextQuestReward,
    loadState,
    saveState,
    resetState,
  };

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    initBrowserApp(api);
  }

  return api;
});

function initBrowserApp(api) {
  let state = api.loadState();
  let timerId = null;
  let remainingSeconds = 180;

  const $ = (id) => document.getElementById(id);
  const all = (selector) => Array.from(document.querySelectorAll(selector));

  function percent(value, max) {
    return `${Math.max(0, Math.min(100, Math.round((value / max) * 100)))}%`;
  }

  function setText(id, value) {
    const element = $(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setBar(id, value) {
    const element = $(id);
    if (element) {
      element.style.width = value;
    }
  }

  function appendModalParagraph(container, text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    container.appendChild(paragraph);
  }

  function appendModalList(container, points) {
    const list = document.createElement("ul");
    points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function openModal(modalId) {
    const modal = $("info-modal");
    const title = $("modal-title");
    const kicker = $("modal-kicker");
    const body = $("modal-body");
    const content = api.MODAL_CONTENT[modalId];

    if (!modal || !title || !kicker || !body || !content) return;

    kicker.textContent = content.kicker;
    title.textContent = content.title;
    body.replaceChildren();
    content.paragraphs.forEach((paragraph) => appendModalParagraph(body, paragraph));
    appendModalList(body, content.points);

    modal.hidden = false;
    modal.className = "modal-backdrop is-open";
    document.body.classList.add("modal-lock");
    modal.querySelector(".modal-close")?.focus();
  }

  function openFeedbackModal(event) {
    const modal = $("info-modal");
    const title = $("modal-title");
    const kicker = $("modal-kicker");
    const body = $("modal-body");

    if (!modal || !title || !kicker || !body || !event) return;

    kicker.textContent = event.kicker || "动作反馈";
    title.textContent = event.title || "已完成";
    body.replaceChildren();
    (event.paragraphs || []).forEach((paragraph) => appendModalParagraph(body, paragraph));
    appendModalList(body, event.points || []);

    modal.hidden = false;
    modal.className = "modal-backdrop is-open";
    document.body.classList.add("modal-lock");
    modal.querySelector(".modal-close")?.focus();
  }

  function closeModal() {
    const modal = $("info-modal");
    if (!modal) return;

    modal.className = "modal-backdrop";
    modal.hidden = true;
    document.body.classList.remove("modal-lock");
  }

  function formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const rest = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function commit(nextState, options = {}) {
    state = nextState;
    api.saveState(state);
    render();
    if (options.feedback) {
      openFeedbackModal(state.lastEvent);
    }
  }

  function renderTask() {
    const task = api.TASKS[state.currentTaskId] || api.TASKS.walk;
    setText("task-name", task.name);
    setText("task-type", task.type);
    setText("task-description", task.description);
    setText("task-minutes", `${task.minutes} 分钟`);
    setText("task-difficulty", task.difficulty);
    setText("task-reward", `XP +${task.reward.xp} / 源力 +${task.reward.energy}`);
    setText("task-area", api.AREAS[task.area].name);
  }

  function renderAreas() {
    const container = $("area-grid");
    if (!container) return;

    container.innerHTML = Object.values(api.AREAS)
      .map((area) => {
        const unlocked = state.unlockedAreas.includes(area.id);
        return `
          <article class="map-card ${unlocked ? "is-lit" : ""}">
            <span class="status-dot"></span>
            <h3>${area.name}</h3>
            <p>${area.condition}</p>
            <strong>${unlocked ? "已点亮" : "待探索"}</strong>
          </article>
        `;
      })
      .join("");

    all("[data-area-visual]").forEach((node) => {
      node.classList.toggle("is-lit", state.unlockedAreas.includes(node.dataset.areaVisual));
    });
  }

  function renderBadges() {
    const container = $("badge-grid");
    if (!container) return;

    container.innerHTML = Object.values(api.BADGES)
      .map((badge) => {
        const unlocked = state.unlockedBadges.includes(badge.id);
        return `
          <article class="badge-card ${unlocked ? "is-unlocked" : ""}">
            <div class="badge-mark">${unlocked ? "✓" : "·"}</div>
            <h3>${badge.name}</h3>
            <p>${badge.condition}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderAcademy() {
    const container = $("academy-list");
    if (!container) return;

    const ranking = api.getAcademyRanking(state);

    const mine = ranking.find((item) => item.isMine);
    setText("selected-academy", state.selectedAcademy);
    setText("academy-per-capita", mine ? `${mine.perCapitaEnergy} 人均源力` : "0 人均源力");
    setText("academy-cup-rank", mine ? `第 ${ranking.findIndex((item) => item.isMine) + 1} 名` : "未上榜");
    setText("academy-honor-reward", state.honorRewardClaimed ? "集体奖励已领取" : "可根据圣杯名次领取集体奖励");

    all("[data-academy]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.academy === state.selectedAcademy);
    });

    container.innerHTML = ranking
      .map((item, index) => `
        <li class="${item.isMine ? "is-mine" : ""}">
          <span>${index + 1}. ${item.name}</span>
          <strong>${item.perCapitaEnergy} 人均源力</strong>
        </li>
      `)
      .join("");
  }

  function formatQuestReward(reward) {
    return [
      reward.xp ? `XP +${reward.xp}` : "",
      reward.energy ? `源力 +${reward.energy}` : "",
      reward.buildValue ? `建造值 +${reward.buildValue}` : "",
      reward.bondValue ? `羁绊值 +${reward.bondValue}` : "",
    ].filter(Boolean).join(" / ");
  }

  function renderQuestLine() {
    const container = $("quest-grid");
    if (!container) return;

    const progress = api.getQuestProgress(state);
    const claimable = progress.find((quest) => quest.complete && !quest.claimed);
    const active = progress.find((quest) => !quest.complete);

    setText(
      "quest-guide",
      claimable
        ? `${claimable.name}已完成，可以领取阶段奖励。`
        : active
          ? `下一步：${active.nextAction}。`
          : "今日冒险线已打通，周报会记录这次完整循环。"
    );

    container.innerHTML = progress
      .map((quest, index) => {
        const status = quest.claimed ? "已领取" : quest.complete ? "可领取" : "进行中";
        const classes = [
          "quest-card",
          quest.complete ? "is-complete" : "",
          quest.claimed ? "is-claimed" : "",
        ].filter(Boolean).join(" ");

        return `
          <article class="${classes}">
            <span class="quest-step">${index + 1}</span>
            <h3>${quest.name}</h3>
            <p>${quest.requirement}</p>
            <strong>${status}</strong>
            <small>${formatQuestReward(quest.reward)}</small>
          </article>
        `;
      })
      .join("");

    all("[data-energy-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.energyMode === state.energyMode);
    });
  }

  function renderFlagWar() {
    const container = $("flag-grid");
    if (!container) return;

    const areas = api.getFlagWar(state);
    const current = areas.find((area) => area.isCurrent) || areas[0];

    setText("flag-current-area", current ? `当前任务区域：${current.name}` : "当前任务区域：待选择");
    setText("settlement-summary", `已结算 ${state.settlementCount} 次，控制区域 ${state.controlledAreas.length} 个。`);
    setText("controlled-areas", state.controlledAreas.length ? state.controlledAreas.map((id) => api.AREAS[id].name).join(" / ") : "暂无控制区域");
    setText("next-day-area-bonus", `${state.nextDayAreaBonus}% 源力加成`);

    container.innerHTML = areas
      .map((area) => {
        const classes = ["flag-card", area.isCurrent ? "is-current" : "", area.status === "领先" ? "is-leading" : ""]
          .filter(Boolean)
          .join(" ");

        return `
          <article class="${classes}">
            <div class="flag-card-head">
              <h3>${area.name}</h3>
              <strong>${area.status}</strong>
            </div>
            <p>对手：${area.opponent}</p>
            <div class="control-duel" aria-hidden="true">
              <span style="width: ${area.control}%"></span>
            </div>
            <div class="flag-score">
              <span>${state.selectedAcademy} ${area.control}%</span>
              <span>${area.opponentControl}% 对手</span>
            </div>
            <small>足迹值 +${area.footprints}${area.isControlled ? " / 已控制" : ""}</small>
          </article>
        `;
      })
      .join("");
  }

  function renderReport() {
    const areaCount = state.unlockedAreas.length;
    const badgeCount = state.unlockedBadges.length;
    setText("report-summary", `本周完成 ${state.weeklyWorkouts} 次运动，累计 ${state.weeklyMinutes} 分钟，点亮 ${areaCount} 个校园区域，解锁 ${badgeCount} 枚徽章。`);
    setText("report-guild", `${state.guildContribution} 建造值`);
    setText("report-academy", `${state.academyEnergy} 源力`);
  }

  function render() {
    const nextLevelXp = state.level * 100;
    const currentLevelBase = (state.level - 1) * 100;
    const levelProgress = state.xp - currentLevelBase;
    const levelNeed = nextLevelXp - currentLevelBase;

    setText("level", `Lv.${state.level}`);
    setText("xp", state.xp);
    setText("energy", state.energy);
    setText("build-value", state.buildValue);
    setText("bond-value", state.bondValue);
    setText("weekly-workouts", state.weeklyWorkouts);
    setText("weekly-minutes", state.weeklyMinutes);
    setText("area-count", `${state.unlockedAreas.length} / ${Object.keys(api.AREAS).length}`);
    setText("guild-contribution", state.guildContribution);
    setText("status-message", state.lastMessage);
    setText("xp-progress-text", `${levelProgress} / ${levelNeed}`);
    setBar("xp-progress", percent(levelProgress, levelNeed));

    setText("timer-display", formatTime(remainingSeconds));
    setText("focus-task", api.FOCUS_TASKS[state.focusTaskIndex]);
    setText("guild-build", `${state.guildBuild} / 300`);
    setText("guild-level", `Lv.${state.guildLevel}`);
    setText("guild-building", state.guildBuildingName);
    setText("guild-bonus", `${state.guildBonusPercent}% 全员收益加成`);
    setText("boss-hp", `${state.bossHp} / 620`);
    setText("boss-damage", state.bossDamage);
    setBar("guild-progress", percent(state.guildBuild, 300));
    setBar("boss-progress", percent(state.bossHp, 620));

    renderTask();
    renderAreas();
    renderBadges();
    renderAcademy();
    renderQuestLine();
    renderFlagWar();
    renderReport();
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function bindActions() {
    const actions = {
      startStarter: () => {
        document.querySelector("#starter")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!timerId) {
          timerId = setInterval(() => {
            remainingSeconds = Math.max(0, remainingSeconds - 1);
            setText("timer-display", formatTime(remainingSeconds));
            if (remainingSeconds === 0) {
              stopTimer();
              commit(api.completeStarter(state), { feedback: true });
            }
          }, 1000);
        }
      },
      pauseTimer: () => stopTimer(),
      resetTimer: () => {
        stopTimer();
        remainingSeconds = 180;
        render();
      },
      completeStarter: () => {
        stopTimer();
        remainingSeconds = 180;
        commit(api.completeStarter(state), { feedback: true });
      },
      completeTask: () => commit(api.completeTask(state, state.currentTaskId), { feedback: true }),
      randomTask: () => commit(api.nextRandomTask(state)),
      lighterTask: () => commit(api.nextFocusTask(state)),
      focusRestart: () => commit(api.restartFocusMove(state), { feedback: true }),
      claimQuestReward: () => commit(api.claimNextQuestReward(state), { feedback: true }),
      plantFlag: () => commit(api.plantFlag(state), { feedback: true }),
      settleAreaControl: () => commit(api.settleAreaControl(state), { feedback: true }),
      contributeGuild: () => commit(api.contributeGuild(state), { feedback: true }),
      attackBoss: () => commit(api.attackBoss(state), { feedback: true }),
      sendCheer: () => commit(api.sendCheer(state), { feedback: true }),
      contributeAcademy: () => commit(api.contributeAcademy(state), { feedback: true }),
      claimAcademyHonor: () => commit(api.claimAcademyHonor(state), { feedback: true }),
      closeModal: () => closeModal(),
      resetAll: () => {
        stopTimer();
        remainingSeconds = 180;
        commit(api.resetState());
      },
    };

    all("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = actions[button.dataset.action];
        if (action) action();
      });
    });

    all("[data-task-id]").forEach((button) => {
      button.addEventListener("click", () => {
        commit(api.setCurrentTask(state, button.dataset.taskId));
      });
    });

    all("[data-energy-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        commit(api.setEnergyMode(state, button.dataset.energyMode));
      });
    });

    all("[data-academy]").forEach((button) => {
      button.addEventListener("click", () => {
        commit(api.setSelectedAcademy(state, button.dataset.academy));
      });
    });

    all("[data-modal]").forEach((button) => {
      button.addEventListener("click", () => {
        openModal(button.dataset.modal);
      });
    });

    $("info-modal")?.addEventListener("click", (event) => {
      if (event.target === $("info-modal")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindActions();
    render();
  });
}
