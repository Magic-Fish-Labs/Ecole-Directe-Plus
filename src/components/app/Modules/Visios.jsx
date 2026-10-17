import { GenericDataList, ModulesSkeleton } from "./Shared";

export default function Visios({ isLoading, visios }) {
    if (isLoading) {
        return <ModulesSkeleton />;
    }
    return <GenericDataList data={visios} emptyMessage="Pas de visioconférence ici non plus" />;
}
