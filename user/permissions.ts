const AdminUsers = [
    'triyuga',
    'sitapati',
    // 'RedMoonWT1',
    'Purpsta',
]

const TestUsers = ['Luwak_kopi'].concat(AdminUsers)

export const isAdminUser = (player): boolean =>
    !!AdminUsers.find(u => u === player.name)
export const isTestUser = (player): boolean =>
    !!TestUsers.find(u => u === player.name)
