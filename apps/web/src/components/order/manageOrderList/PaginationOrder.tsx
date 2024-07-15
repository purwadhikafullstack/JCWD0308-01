import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type PaginationProps = {
    page: number | string,
    totalPages: number,
    urlParamName?: string
  }

export default function PaginationOrder({ page, totalPages, urlParamName }: PaginationProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePageChange = (page: number, event: React.MouseEvent) => {
        event.preventDefault();
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        const newUrl = formUrlQuery({
            params: searchParams.toString(),
            key: 'page',
            value: page.toString(),
        });
        router.push(newUrl, { scroll: false });
    };

    const pages = [
        Math.max(1, currentPage - 2),
        Math.max(1, currentPage - 1),
        currentPage,
        Math.min(currentPage, currentPage + 1),
        Math.min(currentPage, currentPage + 2)
    ].filter((page, index, self) => self.indexOf(page) === index);

    const showEllipsis = totalPages - currentPage > 3;

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => handlePageChange(currentPage - 1, e)} />
                </PaginationItem>
                {isMobile ? (
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            isActive={true}
                        >
                            {currentPage}
                        </PaginationLink>
                    </PaginationItem>
                ) : (
                    pages.map((page, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => handlePageChange(page, e)}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))
                )}
                {showEllipsis && !isMobile && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => handlePageChange(currentPage + 1, e)} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
