import React from 'react'

import Header from './header'
import Content from './content'

import styles from './index.module.scss'

const MainContent: React.FC = () => {
  return (
    <main className={styles.mainContent}>
      <Header />
      <Content />
    </main>
  )
}

export default MainContent
