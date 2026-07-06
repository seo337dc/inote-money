import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AppBrand from "@/components/AppBrand";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <div className="flex flex-col items-center gap-3">
          <AppBrand />
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

        {/* 프로젝트 문서 링크 */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border w-full max-w-xs">
          <p className="text-xs text-muted-foreground">프로젝트 문서</p>
          <div className="flex gap-4">
            <a
              href="https://app.notion.com/p/35ab5151f22f8048b08cdc6ee8c38253"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              기획 문서
            </a>
            <a
              href="https://app.notion.com/p/devlog-de6909091d054042a9b39ee1ebc7283b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              개발 문서
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
