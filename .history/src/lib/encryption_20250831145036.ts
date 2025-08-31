import CryptoJS from 'crypto-js'

export class FileEncryption {
  private static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString()
  }

  static async encryptFile(file: File): Promise<{
    encryptedData: Blob
    encryptionKey: string
    originalName: string
  }> {
    const encryptionKey = this.generateKey()
    const arrayBuffer = await file.arrayBuffer()
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
    
    const encrypted = CryptoJS.AES.encrypt(wordArray, encryptionKey).toString()
    const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' })
    
    return {
      encryptedData: encryptedBlob,
      encryptionKey,
      originalName: file.name
    }
  }

  static async decryptFile(
    encryptedData: ArrayBuffer, 
    encryptionKey: string,
    originalName: string,
    mimeType: string
  ): Promise<File> {
    const encryptedText = new TextDecoder().decode(encryptedData)
    const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey)
    
    // Convert decrypted WordArray back to ArrayBuffer
    const typedArray = new Uint8Array(decrypted.sigBytes)
    for (let i = 0; i < decrypted.sigBytes; i++) {
      typedArray[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    }
    
    return new File([typedArray], originalName, { type: mimeType })
  }

  static generateRandomFileName(originalName: string): string {
    const extension = originalName.split('.').pop()
    const randomId = CryptoJS.lib.WordArray.random(128/8).toString()
    return `${randomId}.${extension}`
  }
}
