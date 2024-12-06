import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Login from "../components/Login";
import Encuestas from "../components/Encuestas";
import Perfil from "../components/Perfil";
import Usuarios from "../components/Usuarios";
import Dashboard from "../components/Dashboard";
import MisEncuestas from "../components/MisEncuestas";
import AsignarEncuestas from "../components/AsignarEncuestas";
import AgregarPreguntasVista from "../components/AgregarPreguntasVista";
import CrearEncuesta from "../components/CrearEncuesta";
import ModificarEncuesta from "../components/ModificarEncuesta";
import Roles from "../components/Roles";
import Areas from "../components/Areas";
import ResponderEncuesta from "../components/ResponderEncuesta";
import EstadisticasEncuesta from "../components/EstadisticasEncuesta";
import Unauthorized from "../components/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";
import About from "../pages/public/about";
import NotFound from "../pages/public/notfound";
import PublicRoute from "../components/PublicRoute";
import ErrorRoute from "../components/ErrorRoute";
import Home from "../components/Home";
//cursos
import AgregarContenido from "../pages/private/agregar_contenido";
import AgregarCursos from "../pages/private/agregar_cursos";
import AgregarLecciones from "../pages/private/agregar_lecciones";
import AgregarModulos from "../pages/private/agregar_modulos";
import AsignarAreaACurso from "../pages/private/asignarArea";
import VistaCursosAdmin from "../pages/private/cursos-admin";
import Cursos_home from "../pages/private/cursos";
import DashboardRRHH from "../pages/private/dashboard-rh";
import EditarUsuario from "../pages/private/editarUsuario";
import HomeUsuarios from "../pages/private/home-usuarios";
import ListadoCursos from "../pages/private/listado_cursos";
import ListadoCursosUsuario from "../pages/private/listado-cursos-usuario";
import ListadoAreas from "../pages/private/listar-areas";
import ListadoUsuarios from "../pages/private/listarUsuarios";
import Modificar_curso from "../pages/private/modificar_curso";
import Modificar_lecciones from "../pages/private/modificar_lecciones";
import Modificar_modulo from "../pages/private/modificar_modulos";
import FormularioModArea from "../pages/private/modificar-area";
import FormularioArea from "../pages/private/nueva-area";
import N_usuario from "../pages/private/nuevo-usuario";
import PerfilUsuario from "../pages/private/perfil-usuario";
import Perfiladm from "../pages/private/perfiladmin";
import SubirContenido from "../pages/private/subircontenido";
import UsuariosAdmin from "../pages/private/usuarios-admin";
import VerContenido from "../pages/private/ver_contenido";
import DetalleCurso from "../pages/private/vercurso-usuario";
import Vercurso from "../pages/private/vercurso";
import DetalleUsuarioLecciones from "../pages/private/vista-perfil-rh";

const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas de error */}
      <Route
        path="/unauthorized"
        element={
          <ErrorRoute type="unauthorized">
            <Unauthorized />
          </ErrorRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ErrorRoute type="notFound">
            <NotFound />
          </ErrorRoute>
        }
      />

      {/* Rutas públicas */}
      <Route path="/about" element={<About />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Rutas protegidas con roles */}
      <Route
        path="/encuestas"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Usuario"]}>
            <>
              <Navbar />
              <Encuestas />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/misencuestas"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Usuario"]}>
            <>
              <Navbar />
              <MisEncuestas />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <Usuarios />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Usuario"]}>
            <>
              <Navbar />
              <Perfil />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Administrador", "Usuario"]}>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/asignarencuestas"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <AsignarEncuestas />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-preguntas/:id"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <AgregarPreguntasVista />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crear-encuesta"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <CrearEncuesta />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-encuesta/:idEncuesta"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <ModificarEncuesta />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <Roles />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/areas"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <Areas />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/responderEncuesta/:encuestaId"
        element={
          <ProtectedRoute allowedRoles={["Usuario", "Administrador"]}>
            <>
              <Navbar />
              <ResponderEncuesta />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estadisticas-encuesta/:encuestaId"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <>
              <Navbar />
              <EstadisticasEncuesta />
            </>
          </ProtectedRoute>
        }
      />

      {/* Rutas capacitaciones */}
      <Route
        path="/cursos"
        element={
          <ProtectedRoute>
            <Navbar />
            <Cursos_home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursos-admin"
        element={
          <ProtectedRoute>
            <Navbar />
            <VistaCursosAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-contenido"
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-cursos"
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarCursos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-lecciones/:cursoId/:moduloId"
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarLecciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-modulos/:cursoId"
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarModulos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asignar-area/:cursoId"
        element={
          <ProtectedRoute>
            <Navbar />
            <AsignarAreaACurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-rh"
        element={
          <ProtectedRoute>
            <Navbar />
            <DashboardRRHH />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-usuario/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <EditarUsuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-usuarios"
        element={
          <ProtectedRoute>
            <Navbar />
            <HomeUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listado-cursos"
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoCursos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listado-cursos-usuario"
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoCursosUsuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listar-areas"
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoAreas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listar-usuarios"
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-curso/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_curso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-lecciones/:cursoId/:moduloId/:leccionId"
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_lecciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-modulos/:cursoId/:moduloId"
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_modulo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-area"
        element={
          <ProtectedRoute>
            <Navbar />
            <FormularioModArea />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nueva-area"
        element={
          <ProtectedRoute>
            <Navbar />
            <FormularioArea />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nuevo-usuario"
        element={
          <ProtectedRoute>
            <Navbar />
            <N_usuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil-usuario"
        element={
          <ProtectedRoute>
            <Navbar />
            <PerfilUsuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfiladmin"
        element={
          <ProtectedRoute>
            <Navbar />
            <Perfiladm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subir-contenido"
        element={
          <ProtectedRoute>
            <Navbar />
            <SubirContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios-admin"
        element={
          <ProtectedRoute>
            <Navbar />
            <UsuariosAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ver-contenido/:leccionId"
        element={
          <ProtectedRoute>
            <Navbar />
            <VerContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vista-perfil-rh/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <DetalleUsuarioLecciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vercurso/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <Vercurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vercurso-usuario/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <DetalleCurso />
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;
