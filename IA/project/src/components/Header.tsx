export function Header() {
  return (
    <header className="bg-[#002060] text-white py-6 px-8 shadow-lg">
      <div className="max-w-[1800px] mx-auto flex items-center gap-6">
        <img
          src="https://www.itm.edu.co/favicon.ico"
          alt="ITM Logo"
          className="w-16 h-16 object-contain bg-white rounded-lg p-2"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-wide">
            LABORATORIO TÉRMICO
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Instituto Tecnológico Metropolitano - Medellín
          </p>
        </div>
      </div>
    </header>
  );
}
