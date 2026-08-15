type ContextualRightsFooterProps = { brand: string; year?: number; children?: React.ReactNode };

export default function ContextualRightsFooter({ brand, year = new Date().getFullYear(), children }: ContextualRightsFooterProps) {
  return <footer className="border-t border-white/10 bg-[#080608] px-5 py-5 text-[#B72089] sm:px-10 lg:px-16"><p className="mx-auto w-full max-w-7xl text-xs leading-5">© {year} {brand}. All rights reserved.{children ? <> {children}</> : null}</p></footer>;
}
