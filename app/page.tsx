import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
   <div>
    <h1 className="text-3xl text-green-800 underline">Home</h1>
    <p>This is the develop branch</p>
    <Button>Click Me</Button>
   </div>
  );
}
