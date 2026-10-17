import { GenericDataList, ModulesSkeleton } from "./Shared";

export default function Correspondence({ isLoading, carnet }) {
    if (isLoading) {
        return <ModulesSkeleton />;
    }
    return <GenericDataList data={carnet} emptyMessage="Aucune correspondance disponible" />;
}
