import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@emotion/react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistor, store } from './redux/store.js'
import { ToastContainer } from 'react-toastify'


import theme from './theme.js'
import App from './App.jsx'
import { preventNumberInputScroll } from './utils/preventNumberInputScroll.js'

const queryClient = new QueryClient()
preventNumberInputScroll()
createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <App />
          <ToastContainer autoClose={3000} />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </ThemeProvider>
)
