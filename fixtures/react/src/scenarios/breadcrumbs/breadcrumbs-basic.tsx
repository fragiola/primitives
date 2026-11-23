import { Breadcrumbs } from "../../kit/ui/breadcrumbs.tsx";

/** spec/breadcrumbs.md, `/breadcrumbs/basic` */
export function BreadcrumbsBasic() {
    return (
        <Breadcrumbs.Root aria-label="Breadcrumb">
            <Breadcrumbs.List>
                <Breadcrumbs.Item>
                    <Breadcrumbs.Link href="#home">Home</Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                <Breadcrumbs.Item>
                    <Breadcrumbs.Link href="#docs">Docs</Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                <Breadcrumbs.Item>
                    <Breadcrumbs.Link href="#components" disabled>
                        Components
                    </Breadcrumbs.Link>
                </Breadcrumbs.Item>
                <Breadcrumbs.Separator>/</Breadcrumbs.Separator>
                <Breadcrumbs.Item>
                    <Breadcrumbs.Link href="#breadcrumbs" current>
                        Breadcrumbs
                    </Breadcrumbs.Link>
                </Breadcrumbs.Item>
            </Breadcrumbs.List>
        </Breadcrumbs.Root>
    );
}
