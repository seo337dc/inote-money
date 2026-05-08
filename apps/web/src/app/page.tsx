import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-primary">💰</span>
          <h1 className="text-3xl font-bold tracking-tight">iNote Money</h1>
          <p className="text-muted-foreground text-base">
            나의 수입·지출·투자를 한 눈에 관리하세요
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/demo" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            데모 보기
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            시작하기
          </Link>
        </div>
      </main>
    </div>
  );
}
