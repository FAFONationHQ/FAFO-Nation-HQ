type ContextualRightsFooterProps = { brand: string; year?: number; children?: React.ReactNode };

export default function ContextualRightsFooter({ brand, year = new Date().getFullYear(), children }: ContextualRightsFooterProps) {
  return <footer className="border-t border-white/10 bg-[#080608] px-5 py-10 text-[#B72089] sm:px-10 lg:px-16"><div className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-xs leading-6 sm:flex-row sm:items-end sm:justify-between"><p>© {year} {brand}. All rights reserved.</p>{children ? <div className="text-[#B72089]">{children}</div> : null}</div></footer>;
}
