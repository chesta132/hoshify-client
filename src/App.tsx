import { BrowserRouter, Route, Routes } from "react-router";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { Layout } from "./layouts/Layout";
import { AppearanceProvider } from "./contexts/appearance/AppearanceContext";
import "./utils/extends";
import { SettingsPage } from "./pages/SettingPage";
import { HeaderProvider } from "./contexts/HeaderContext";
import { SearchProvider } from "./contexts/search/SearchContext";
import { TodoPage } from "./pages/TodoPage";
import { NotePage } from "./pages/NotePage";
import { MoneyPage } from "./pages/MoneyPage";
import { CalendarPage } from "./pages/CalendarPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { SigninPage } from "./pages/auth/SigninPage";
import { UserProvider } from "./contexts/UserContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import { LinkProvider } from "./contexts/LinkContext";
import { TodosProvider } from "./contexts/TodoContext";
import { MoneyProvider } from "./contexts/MoneyContext";
import { NotesProvider } from "./contexts/NoteContext";

function App() {
  return (
    <>
      <BrowserRouter>
        <ErrorProvider>
          <UserProvider>
            <TodosProvider>
              <NotesProvider>
                <LinkProvider>
                  <MoneyProvider>
                    <SearchProvider>
                      <HeaderProvider>
                        <AppearanceProvider>
                          <Routes>
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/signin" element={<SigninPage />} />
                            <Route path="/" element={<Layout />}>
                              <Route path="/" index element={<DashboardPage />} />
                              <Route path="/todos" element={<TodoPage />} />
                              <Route path="/notes" element={<NotePage />} />
                              <Route path="/money" element={<MoneyPage />} />
                              <Route path="/calendar" element={<CalendarPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                            </Route>
                          </Routes>
                        </AppearanceProvider>
                      </HeaderProvider>
                    </SearchProvider>
                  </MoneyProvider>
                </LinkProvider>
              </NotesProvider>
            </TodosProvider>
          </UserProvider>
        </ErrorProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
