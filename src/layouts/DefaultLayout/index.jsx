import Header from './Header'
import Footer from './Footer'

function DefaultLayout({ children }) {
  return (
    <div>
      <Header />
      <main className="">{children}</main>
      <Footer />
    </div>
  )
}

export default DefaultLayout