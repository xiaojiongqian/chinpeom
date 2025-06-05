import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Firebase配置信息 - 来自DEVELOPMENT.md
const firebaseConfig = {
  apiKey: "AIzaSyCHt0r0EgWVt7xhOZS_piykzBcTSjKexek",
  authDomain: "poem2guess-8d19f.firebaseapp.com",
  projectId: "poem2guess-8d19f",
  storageBucket: "poem2guess-8d19f.firebasestorage.app",
  messagingSenderId: "1090834027836",
  appId: "1:1090834027836:web:d4a2b8f4f5e1e2f3a4b5c6"
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 初始化 Firebase Authentication 并获取引用
export const auth = getAuth(app)

// 配置 Google 认证提供商
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')

// 设置自定义参数
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app 