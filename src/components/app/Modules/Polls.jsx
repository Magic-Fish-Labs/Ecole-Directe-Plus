import { GenericDataList, ModulesSkeleton } from "./Shared";

export default function Polls({ isLoading, polls }) {
    if (isLoading) {
        return <ModulesSkeleton />;
    }
    return <GenericDataList data={polls} emptyMessage="Aucun sondage disponible" />;
}
