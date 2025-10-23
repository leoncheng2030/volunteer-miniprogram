/**
 * 国密SM2加解密工具类
 * 使用 miniprogram-sm-crypto 库
 *
 * @author yubaoshan
 */

import { sm2 } from 'miniprogram-sm-crypto'
import type { sm2 as Sm2Type } from 'miniprogram-sm-crypto'

// 常量定义
const CIPHER_MODE: 'hex' | 'base64' | 0 | 1 = 1 // 加密模式：'hex' | 'base64' | 1 | 0 (C1C3C2)
const PUBLIC_KEY = '04298364ec840088475eae92a591e01284d1abefcda348b47eb324bb521bb03b0b2a5bc393f6b71dabb8f15c99a0050818b56b23f31743b93df9cf8948f15ddb54'

/**
 * 国密SM2加解密工具类
 */
class Sm2CryptoUtil {
  private readonly sm2: typeof Sm2Type
  private readonly cipherMode: 'hex' | 'base64' | 0 | 1
  private readonly publicKey: string

  constructor() {
    this.sm2 = sm2
    this.cipherMode = CIPHER_MODE
    this.publicKey = PUBLIC_KEY
  }

  /**
   * SM2加密
   * @param msgString 待加密的字符串
   * @returns 加密后的字符串
   */
  public doSm2Encrypt(msgString: string): string {
    if (!msgString) {
      throw new Error('加密内容不能为空')
    }
    
    try {
      return this.sm2.doEncrypt(msgString, this.publicKey, this.cipherMode)
    } catch (error) {
      throw new Error(`SM2加密失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * SM2数组加密（兼容旧版方法）
   * @param msgString 待加密的字符串（数组格式）
   * @returns 加密后的字符串
   */
  public doSm2ArrayEncrypt(msgString: string): string {
    return this.doSm2Encrypt(msgString)
  }

  /**
   * 生成SM2密钥对
   * @returns 密钥对对象
   */
  public generateKeyPair(): { publicKey: string; privateKey: string } {
    try {
      return this.sm2.generateKeyPairHex()
    } catch (error) {
      throw new Error(`生成密钥对失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取公钥
   * @returns 公钥字符串
   */
  public getPublicKey(): string {
    return this.publicKey
  }

  /**
   * 获取加密模式
   * @returns 加密模式
   */
  public getCipherMode(): string {
    return this.cipherMode
  }
}

// 创建单例实例
const sm2CryptoUtil = new Sm2CryptoUtil()

// 导出工具类实例
export default sm2CryptoUtil

// 导出类型定义
export type { Sm2Type }

// 导出算法模块
export { sm2 }

// 导出常量
export { CIPHER_MODE, PUBLIC_KEY }
