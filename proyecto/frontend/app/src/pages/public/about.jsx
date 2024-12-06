import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Feature = ({ title, description, icon }) => (
  <div className="flex items-start space-x-4 transition-all duration-300 ease-in-out transform hover:scale-105">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const About = ({
  companyName,
  tagline,
  description,
  features = [],
  imageSrc,
  imageAlt,
}) => {
  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase transition-all duration-300 ease-in-out transform hover:scale-105">
            Acerca de {companyName}
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {tagline}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            {description}
          </p>
        </div>

        <div className="mt-10">
          {features.length > 0 && (
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <Feature key={index} {...feature} />
              ))}
            </dl>
          )}
        </div>

        <div className="mt-10 lg:mt-20 flex justify-center transition-all duration-300 ease-in-out transform hover:scale-105">
          <img
            className="rounded-lg shadow-xl max-w-full h-auto"
            src={imageSrc}
            alt={imageAlt}
          />
        </div>
        <div className="text-center mt-10">
          <Button asChild>
            <Link to="/login">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default About;
