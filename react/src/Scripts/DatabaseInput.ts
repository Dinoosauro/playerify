import IndexedDatabase from "./IndexedDatabase";

export default function DatabaseInput(id: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
        if (input.files) {
            const blob = new Blob([await input.files[0].arrayBuffer()], { type: input.files[0].type });
            window.updateRenderState(prevState => { return { ...prevState, [id]: URL.createObjectURL(blob) } });
            IndexedDatabase.set({ db: await IndexedDatabase.db(), object: { UserContent: id, blob: blob } });
        }
    }
    input.click();

}