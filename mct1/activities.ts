export enum activityTypes {
    // Move activities
    WALK = 'WALK',
    SWIM = 'SWIM',
    SPRINT = 'SPRINT',
    JUMP = 'JUMP',
    SPRINT_JUMP = 'SPRINT_JUMP',
    CLIMB_LADDER = 'CLIMB_LADDER',
    CLIMB_VINE = 'CLIMB_VINE',
    // Non-move activities
    BLOCK_BREAK = 'BLOCK_BREAK',
    ATTACK_LIVING_ENTITY = 'ATTACK_LIVING_ENTITY',
    SHOOT_BOW = 'SHOOT_BOW',
    LIGHTNING_STRIKE = 'LIGHTNING_STRIKE',
}

export enum activityCosts {
    // Move activities
    WALK = 0.01, // per block travelled
    SWIM = 0.02, // per block travelled
    SPRINT = 0.1, // per block travelled
    JUMP = 0.05, // per jump
    SPRINT_JUMP = 0.1, // per jump
    CLIMB_LADDER = 0.02, // per block travelled
    CLIMB_VINE = 0.02, // per block travelled
    // Non-move activities
    BLOCK_BREAK = 0.005, // per block
    ATTACK_LIVING_ENTITY = 0.1, // per attack landed
    SHOOT_BOW = 0.1, // per shot
    LIGHTNING_STRIKE = 0.1, // per lightning strike
}
