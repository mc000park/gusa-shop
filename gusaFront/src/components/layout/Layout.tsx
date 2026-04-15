import Header from "./Header"
import Footer from "./Footer"

interface Props {
    children: React.ReactNode
}

const Layout = ({children}: Props) => {
    return (
        <>
        <Header />
        <main className="p-4">
            {children}
        </main>
        <Footer />
        </>
    )
}

export default Layout