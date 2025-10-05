import { useUser } from "@/contexts";
import { QuickLinks } from "../components/overviews/quick-links/QuickLinks";
import { MoneyOverview } from "@/components/overviews/money-overview/MoneyOverview";
import { TodoOverview } from "@/components/overviews/todo-overview/TodoOverview";
import { NoteOverview } from "@/components/overviews/note-overview/NoteOverview";

export const DashboardPage = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2 md:gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Welcome to Hoshify, {user.fullName}!</h1>
        <p className="text-muted-foreground text-sm md:text-base">All-in-one personal management dashboard</p>
      </section>
      <section>
        <QuickLinks />
      </section>
      <section>
        <MoneyOverview />
      </section>
      <section>
        <TodoOverview />
      </section>
      <section>
        <NoteOverview />
      </section>
    </div>
  );
};
