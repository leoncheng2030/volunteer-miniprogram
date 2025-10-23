/**
 * miniprogram-sm-crypto 模块的类型声明文件
 */

declare module 'miniprogram-sm-crypto' {
  export namespace sm2 {
    /**
     * 生成密钥对
     * @returns 密钥对对象
     */
    export function generateKeyPairHex(): {
      publicKey: string;
      privateKey: string;
    };

    /**
     * SM2加密
     * @param msgString 待加密的字符串
     * @param publicKey 公钥
     * @param cipherMode 加密模式 'hex' | 'base64' | '1' | '0'
     * @returns 加密后的字符串
     */
    export function doEncrypt(
      msgString: string,
      publicKey: string,
      cipherMode?: 'hex' | 'base64' | 1 | 0
    ): string;

    /**
     * SM2解密
     * @param encryptData 加密数据
     * @param privateKey 私钥
     * @param cipherMode 加密模式 'hex' | 'base64' | '1' | '0'
     * @returns 解密后的字符串
     */
    export function doDecrypt(
      encryptData: string,
      privateKey: string,
      cipherMode?: 'hex' | 'base64' | 1 | 0
    ): string;
  }

  export namespace sm3 {
    /**
     * SM3哈希
     * @param data 待哈希的数据
     * @returns 哈希值
     */
    export function sm3(data: string): string;
  }

  export namespace sm4 {
    /**
     * SM4加密
     * @param msg 待加密的数据
     * @param key 密钥
     * @param mode 加密模式 'ecb' | 'cbc'
     * @returns 加密后的数据
     */
    export function encrypt(
      msg: string,
      key: string,
      mode?: 'ecb' | 'cbc'
    ): string;

    /**
     * SM4解密
     * @param encryptData 加密数据
     * @param key 密钥
     * @param mode 加密模式 'ecb' | 'cbc'
     * @returns 解密后的数据
     */
    export function decrypt(
      encryptData: string,
      key: string,
      mode?: 'ecb' | 'cbc'
    ): string;
  }

  // 导出所有命名空间
  export { sm2, sm3, sm4 };
}
