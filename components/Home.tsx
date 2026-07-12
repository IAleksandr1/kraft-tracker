"use client";

type Props = {
  onNavigate: (tab: "accounting" | "habits") => void;
};

export default function Home({ onNavigate }: Props) {
  return (
    <div className="pt-6">
      <div className="bg-paper border-2 border-ink p-6 sm:p-10 relative shadow-[6px_6px_0_0_#161513]">
        <p className="stamp mb-5">день первый</p>
        <h2 className="font-display text-3xl sm:text-5xl leading-[1.05] tracking-tight max-w-2xl">
          ЖУРНАЛ, КОТОРЫЙ НЕ ВРЁТ.
        </h2>
        <p className="font-mono text-sm sm:text-base text-ink-soft mt-5 max-w-xl">
          Деньги и привычки редко выглядят так, как кажется по памяти. Здесь
          — только то, что ты сам записал: без иллюзий и без оценок. Всё, что
          не записано — забывается. Всё, что записано — можно посчитать,
          сравнить и изменить.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mt-6">
        <button
          onClick={() => onNavigate("accounting")}
          className="text-left bg-paper border-2 border-ink p-6 hover:bg-paper-dark transition-colors group"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-lg">ЗАМЕТКИ</h3>
            <span className="stamp">в Google Таблице</span>
          </div>
          <p className="font-mono text-sm text-graphite mb-6">
            Пишешь заметку, выбираешь тему — она попадает в таблицу с датой,
            категорией и суммой. Сумму можно ввести вручную или дать
            распознать её из текста.
          </p>
          <span className="font-mono text-sm border-b-2 border-ink group-hover:pl-1 transition-all">
            Открыть заметки →
          </span>
        </button>

        <button
          onClick={() => onNavigate("habits")}
          className="text-left bg-paper border-2 border-ink p-6 hover:bg-paper-dark transition-colors group"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-lg">ПРИВЫЧКИ</h3>
            <span className="stamp">в Google Таблице</span>
          </div>
          <p className="font-mono text-sm text-graphite mb-6">
            Отмечаешь квадратик за каждый день — видно серию подряд идущих
            дней. Хранится на отдельном листе той же таблицы, что и заметки.
          </p>
          <span className="font-mono text-sm border-b-2 border-ink group-hover:pl-1 transition-all">
            Открыть привычки →
          </span>
        </button>
      </div>

      <p className="font-mono text-xs text-graphite/70 text-center mt-8">
        обе вкладки уходят в одну Google Таблицу, каждая на свой лист
      </p>
    </div>
  );
}
