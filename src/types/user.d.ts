interface IAppid {
    sessionKey: string;
    openId: string;
}

interface IUserInfo {
    id: string;
    openId: string;
    avatar: string;
    signature: string;
    account: string;
    name: string;
    nickname: string;
    gender: string;
    age: string;
    type: string; // 'guardian' | 'volunteer'
    parentId: string; // 小雷锋的监护人ID，如果是监护人则为空
    birthday: string;
    nation: string;
    nativePlace: string;
    homeAddress: string;
    mailingAddress: string;
    idCardType: string;
    idCardNumber: string;
    cultureLevel: string;
    politicalOutlook: string;
    college: string;
    education: string;
    eduLength: string;
    degree: string;
    phone: string;
    email: string;
    homeTel: string;
    officeTel: string;
    emergencyContact: string;
    emergencyPhone: string;
    emergencyAddress: string;
    lastLoginIp: string;
    lastLoginAddress: string;
    lastLoginTime: string;
    lastLoginDevice: string;
    latestLoginIp: string;
    latestLoginAddress: string;
    latestLoginTime: string;
    latestLoginDevice: string;
    userStatus: string;
    sortCode: number;
    extJson: string;
    extInfo: {},
    buttonCodeList: any[];
    mobileButtonCodeList: any[];
    permissionCodeList: any[];
    roleCodeList: string[];
    dataScopeList: any[];
    enabled: boolean;
}

// 小雷锋信息接口
export interface IVolunteerInfo {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    age: string;
    gender: string;
    phone: string;
    birthday: string;
    nation: string;
    school: string;  // 所在学校
    grade: string;   // 年级
    status: string; // 状态：active, inactive
    createTime: string;
    updateTime: string;
}

// 新增小雷锋参数接口
export interface IAddVolunteerParams {
    name: string;
    nickname: string;
    age: string;
    gender: string;
    phone: string;
    avatar?: string;
    birthday: string;
    nation: string;
    homeAddress: string;
    mailingAddress: string;
    school: string;
    grade: string;
    homeTel: string;
    cultureLevel: string;
    college: string;
    education: string;
    degree: string;
    emergencyContact: string;
    emergencyPhone: string;
    emergencyAddress: string;
}
