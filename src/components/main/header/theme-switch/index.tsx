import { useAppConfigStore } from '../../../../store/appConfig'
import styles from './index.module.scss'

export const ThemeSwitch = () => {
  const { theme, setTheme } = useAppConfigStore()
  // 处理主题切换
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
  }
  return (
    <div className={styles.themeSelector}>
      <div className={styles.themeOption}>
        <input
          type="radio"
          id="theme-light"
          name="theme"
          value="light"
          checked={theme === 'light'}
          onChange={() => handleThemeChange('light')}
          className={styles.themeRadio}
        />
        <label htmlFor="theme-light" className={styles.themeLabel}>
          <span className={styles.themeIcon}>☀️</span>
          <span className={styles.themeText}>浅色</span>
        </label>
      </div>
      <div className={styles.themeOption}>
        <input
          type="radio"
          id="theme-dark"
          name="theme"
          value="dark"
          checked={theme === 'dark'}
          onChange={() => handleThemeChange('dark')}
          className={styles.themeRadio}
        />
        <label htmlFor="theme-dark" className={styles.themeLabel}>
          <span className={styles.themeIcon}>🌙</span>
          <span className={styles.themeText}>深色</span>
        </label>
      </div>
    </div>
  )
}
