'use client';

import React from 'react';

import Image from 'next/image';
import Slider from 'react-slick';

// TODO: remove unused vars

// interface ArrowProps {
//     className?: string;
//     style?: CSSProperties;
//     onClick?: () => void;
// }

// function SampleNextArrow(props: ArrowProps) {
//     const { className, style, onClick } = props;
//     return <div className={className} style={{ ...style, display: 'block', background: 'red' }} onClick={onClick} />;
// }

// function SamplePrevArrow(props: ArrowProps) {
//     const { className, style, onClick } = props;
//     return (
//         <div className={className} style={{ ...style, display: 'block', backgroundColor: 'green' }} onClick={onClick} />
//     );
// }

export default function AboutSlider() {
    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        autoplay: true,
        centerMode: true,
        centerPadding: '0px',
        autoplaySpeed: 2500,
        draggable: true,
        arrows: true,
        // nextArrow: <SampleNextArrow />,
        // prevArrow: <SamplePrevArrow />,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: '0px' } },
            { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: '0px' } },
        ],
    };

    const images = ['/homeslider/1.png'];

    return (
        <div className="w-full h-full overflow-hidden rounded-2xl">
            <Slider {...settings} className="about-slider">
                {images.map((url, i) => (
                    <div key={i} className="outline-none">
                 
                        <div className="relative w-full aspect-video md:aspect-[16/9] lg:h-[500px]">
                            <Image
                                src={url}
                                alt={`Slide ${i + 1}`}
                                fill
                                priority={i === 0} 
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
