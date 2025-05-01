import { useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";

import image1 from "@/assets/slider1.png";
import image2 from "@/assets/slider2.png";
import image3 from "@/assets/slider3.png";
import image4 from "@/assets/slider4.png";
import image5 from "@/assets/slider5.png";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeroSection = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 3000,
    infinite: true,
    arrows: true,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto md:p-10 rounded-lg items-center justify-center m-4 gap-20">
      <div className="flex flex-col gap-10 md:w-[50%]">
        <div className="flex flex-col gap-5">
          <h1 className="font-bold md:font-extrabold md:text-5xl text-4xl">
            Craving something tasty? We’ve got you covered!
          </h1>
          <p className="text-gray-500">
            Enjoy fresh and delicious meals delivered to your doorstep - anytime, anywhere.
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <Input
            type="text"
            value={searchText}
            placeholder="Search restaurant by name, city & country"
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 shadow-lg"
          />
          <Search className="text-gray-500 absolute inset-y-2 left-2" />
          <Button
            onClick={() => navigate(`/search/${searchText}`)}
            className="bg-orange hover:bg-hoverOrange"
          >
            Search
          </Button>
        </div>
      </div>
      <div className="md:w-[50%] w-full">
        <Slider {...sliderSettings}>
          {[image1, image2, image3, image4, image5].map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="object-cover w-full max-h-[500px] rounded-lg"
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default HeroSection;
