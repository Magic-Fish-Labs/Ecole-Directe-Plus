import { GenericDataList, ModulesSkeleton } from "./Shared";

export default function ClassLife({ isLoading, data }) {
    if (isLoading) {
        return <ModulesSkeleton />;
    }
    return <GenericDataList data={data} emptyMessage="Aucune information pour le moment" />;
}
