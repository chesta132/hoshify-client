import { BrowserRouter, Route, Routes } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./layouts/Layout";
import { AppearanceProvider } from "./contexts/appearance/AppearanceContext";
import "./utils/extends";
import { Settings } from "./pages/Settings";
import { HeaderProvider } from "./contexts/HeaderContext";
import { SearchProvider } from "./contexts/search/SearchContext";

function App() {
  return (
    <>
      <BrowserRouter>
        <SearchProvider>
          <HeaderProvider>
            <AppearanceProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/" index element={<Dashboard />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
            </AppearanceProvider>
          </HeaderProvider>
        </SearchProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
