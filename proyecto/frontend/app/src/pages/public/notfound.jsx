import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-muted-foreground mb-6">
          Página no encontrada
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <Button asChild>
          <Link to="/login">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
