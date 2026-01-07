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

    const images = [''];

    return (
        <Slider {...settings} className="mx-auto mt-10 h-[501px] flex text-center relative">
            {images.map((url, i) => (
                <div key={i} className="wrap">
                    <Image
                        src={url}
                        alt={`Slide ${i + 1}`}
                        fill
                        className="rounded-2xl w-full object-cover shadow-md h-[501px]"
                    />
                </div>
            ))}
        </Slider>
    );
}
