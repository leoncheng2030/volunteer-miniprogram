import { statusMap } from "@/constant";

/**
 * 显示提示消息（统一封装）
 * @param message 提示内容
 * @param icon 图标类型 success | error | none
 * @param duration 显示时长（毫秒）
 */
export const showToast = (message: string, icon: 'success' | 'error' | 'none' = 'none', duration: number = 2000) => {
    uni.showToast({
        title: message,
        icon: icon === 'error' ? 'none' : icon,
        duration: duration
    });
};

export const getStorage = (key: string) => {
    return uni.getStorageSync(key);
};
export const setStorage = (key: string, value: any) => {
    return uni.setStorageSync(key, value);
};
export const removeStorage = (key: string) => {
    return uni.removeStorageSync(key);
};
export const arraySlice = (data: any[], array: any[] = [], optNum = 10): any[] => {
    if (data.length <= optNum) {
        data.length > 0 && array.push(data);
        return array;
    }
    array.push(data.splice(0, optNum));
    return arraySlice(data, array, optNum);
};
export const getUserProfile = () => {
    return new Promise<UniApp.GetUserProfileRes>((resolve, reject) => {
        uni.getUserProfile({
            desc: "获取用户信息，完善用户资料 ",
            success: (res) => {
                resolve(res);
            },
            fail(res) {
                showToast(res.errMsg);
            },
        });
    });
};
export const copy = (str: string) => {
    return new Promise((resolve, reject) => {
        uni.setClipboardData({
            data: str,
            success: () => {
                showToast("复制成功", 'success');
                resolve(true);
            },
            fail: (error) => {
                showToast(error.errMsg);

                reject(false);
            },
        });
    });
};
export const imageToBase64 = (path: string) => {
    return new Promise<UniApp.ReadFileSuccessCallbackResult>((resolve, reject) => {
        // #ifdef MP
        uni.getFileSystemManager().readFile({
            filePath: path,
            encoding: "base64",
            success: (r) => {
                resolve(r);
            },
            fail: (errr) => {
                uni.$u.toast(errr.errMsg);
                reject(errr);
            },
        });
        // #endif
        // #ifdef H5
        uni.request({
            url: path,

            method: "GET",

            responseType: "arraybuffer",

            success: (ress: any) => {
                let base64 = uni.arrayBufferToBase64(ress.data); //把arraybuffer转成base64

                resolve({
                    errMsg: "readFile:ok",
                    data: base64,
                });
            },
            fail: (e) => {
                console.log("图片转换失败");
                resolve({
                    errMsg: "readFile:error",
                    data: "",
                });
            },
        });

        // #endif
    });
};

export const checkPhotoAuth = () => {
    return new Promise((resolve, reject) => {
        uni.getSetting({
            success: (res) => {
                console.log(res);
                if (!res.authSetting["scope.writePhotosAlbum"]) {
                    uni.showModal({
                        title: "警告",
                        content: "检测到您没您未授权相册权限,点击确定获取授权。",
                        success: function (res) {
                            if (res.confirm) {
                                uni.authorize({
                                    scope: "scope.writePhotosAlbum",
                                    success() {
                                        // 用户已经同意
                                        resolve({ code: 200, message: "授权相册成功" });
                                    },
                                    fail(err) {
                                        console.log(err);
                                        resolve({ code: 300, message: "拒绝授权相册" });
                                    },
                                });
                            }
                        },
                    });
                } else {
                    resolve({ code: 200, message: "授权相册成功" });
                }
            },
            fail: () => {
                console.log("点击了拒绝");
            },
        });
    });
};
export const saveImageToPhoto = (path: string) => {
    return new Promise((resolve, reject) => {
        var fileManager = uni.getFileSystemManager();
        fileManager.writeFile({
            filePath: wx.env.USER_DATA_PATH + "/img.png", // 指定图片的临时路径
            data: path, // 要写入的文本或二进制数据
            encoding: "base64", // 指定写入文件的字符编码
            success: (res) => {
                console.log("写入文件成功", res);
                console.log(wx.env.USER_DATA_PATH + "/img.png");
                uni.saveImageToPhotosAlbum({
                    // 保存图片到相册
                    filePath: wx.env.USER_DATA_PATH + "/img.png",
                    success: function (res) {
                        console.log("保存成功", res);
                        resolve(res);
                    },
                    fail: function (err) {
                        console.log("保存失败", err);
                    },
                });
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};
export const saveBowersFile = (picSrc: string) => {
    const a = document.createElement("a");
    const filename = Date.now() + ".png";
    a.href = picSrc; // picSrc  是图片 base64 码，可以直接给 img 的 src 属性，展示图片
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
export const pxToRpx = (px: number) => {
    let scale = uni.upx2px(100) / 100;
    return px / scale;
};
export const getSetting = () => {
    return new Promise<UniApp.GetSettingSuccessResult>((resolve, reject) => {
        uni.getSetting({
            success: (res) => {
                resolve(res);
            },
            fail: (err) => {
                reject(err);
            },
        });
    });
};
// 计算每个门店与当前位置的距离
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球半径(公里)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 保留一位小数
};

export const checkLocationAuth = () => {
    return new Promise(async (resolve, reject) => {
        const check = await getSetting();
        if (check.authSetting["scope.userLocation"]) {
            resolve(true);
        } else {
            reject(false);
        }
    });
};
//获取位置
export const getLocation = () => {
    return new Promise(async (resolve, reject) => {
        const check = await checkLocationAuth();
        if (check) {
            uni.getLocation({
                type: "gcj02",
                altitude: false, // 不需要高度信息
                success: (res) => {
                    resolve(res);
                },
                fail: (err) => {
                    console.log(err);
                    // 根据错误类型给出不同提示
                    let errorMessage = "获取位置失败，将显示默认门店";
                    if (err.errMsg && err.errMsg.includes("no permission")) {
                        errorMessage = "位置权限未开启，将显示默认门店";
                    } else if (err.errMsg && err.errMsg.includes("timeout")) {
                        errorMessage = "位置获取超时，将显示默认门店";
                    }

                    showToast(errorMessage);
                },
                complete: () => {
                    uni.hideLoading();
                },
            });
        } else {
            reject(null);
        }
    });
};

export const getDevicesStatus = (status: string) => {
    const findUnknown = statusMap.find((f) => f.status === "unknown");
    const findStatus = statusMap.find((f) => f.status === status);
    if (findStatus) {
        return findStatus;
    } else {
        return findUnknown;
    }
};
export const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";

    try {
        const date = new Date(timeStr);
        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch (error) {
        return timeStr;
    }
};
export const requestPayment = (data: any) => {
    return new Promise((resolve, reject) => {
        // #ifdef MP
        console.log('支付参数:', data);
        
        // 构建支付参数，支持服务商模式
        const paymentParams: any = {
            provider: data.provider || "wxpay",
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType || "RSA",
            paySign: data.paySign,
        };

        // 移除appId参数，让微信小程序自动使用配置文件中的appId
        // 如果有orderInfo，添加到参数中
        if (data.orderInfo) {
            paymentParams.orderInfo = data.orderInfo;
        }

        // 服务商模式可能需要的额外参数会在package中处理
        // 微信支付会自动处理服务商模式的sub_appid等参数
        
        uni.requestPayment({
            ...paymentParams,
            success: (res: any) => {
                console.log('支付成功:', res);
                if (res.errMsg === "requestPayment:ok") {
                    resolve(res);
                } else {
                    console.warn('支付状态异常:', res);
                    resolve(null);
                    showToast("支付失败");
                }
            },
            fail: (err: any) => {
                console.error('支付失败:', err);
                // 处理用户取消支付的情况
                if (err.errMsg && err.errMsg.includes('cancel')) {
                    showToast("支付已取消");
                } else {
                    showToast("支付失败");
                }
                resolve(null);
            }
        });
        // #endif
    });
};
export const urlToObj = function (url: string) {
    let obj: any = {};
    let str = url.slice(url.indexOf("?") + 1);
    let arr = str.split("&");
    for (let j = arr.length, i = 0; i < j; i++) {
        let arr_temp = arr[i].split("=");
        obj[arr_temp[0]] = arr_temp[1];
    }
    return obj;
};

/**
 * 构建URL查询参数字符串（小程序兼容版）
 * @param params 参数对象
 * @returns 查询参数字符串
 */
export const buildQueryString = (params: Record<string, any>): string => {
    const queryParams: string[] = [];
    
    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }
    
    return queryParams.join('&');
};
