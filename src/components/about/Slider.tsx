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

    const images = [
        'https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
        'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800',
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800',
        'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800',
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800',
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800',
    ];

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
