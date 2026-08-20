import Item from "./Item";
export default function Wanted() {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-4">
        <Item image="/items/jeans.png" />
        <Item image="/items/jeans.png" />
        <Item image="/items/jeans.png" />
        <Item image="/items/jeans.png" />
        <Item image="/items/jeans.png" />
      </div>
    </div>
  );
}
