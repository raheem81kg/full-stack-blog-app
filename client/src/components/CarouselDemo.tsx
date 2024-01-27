import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface props {
   images: string[];
}

const CarouselDemo: React.FC<props> = ({ images }) => {
   return (
      <Carousel className="w-full max-w-full">
         <CarouselContent>
            {/* {Array.from({ length: 2 }).map((_, index) => (
               <CarouselItem key={index}>
                  <div className="p-1">
                     <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                           <div className="text-4xl font-semibold">{index + 1}</div>
                        </CardContent>
                     </Card>
                  </div>
               </CarouselItem>
            ))} */}
            {images?.map((image, index) => {
               return (
                  <CarouselItem key={index}>
                     <Card className="overflow-hidden">
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                           <img
                              src={`../upload/${image}`}
                              className="flex aspect-square items-center justify-center p-0"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                 if (image) e.currentTarget.src = `${image}`; // Set a fallback image URL here
                              }}
                              alt=""
                           />
                        </CardContent>
                     </Card>
                  </CarouselItem>
               );
            })}
         </CarouselContent>
         <CarouselPrevious />
         <CarouselNext />
      </Carousel>
   );
};

export default CarouselDemo;
