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
import AgregarCursos from "../pages/private/agregar_cursos";
import AgregarLecciones from "../pages/private/agregar_lecciones";
import AgregarModulos from "../pages/private/agregar_modulos";
import AsignarAreaACurso from "../pages/private/asignarArea";
import DashboardRRHH from "../pages/private/dashboard-rh";
import EditarUsuario from "../pages/private/editarUsuario";
import ListadoCursos from "../pages/private/listado_cursos";
import ListadoAreas from "../pages/private/listar-areas";
import ListadoUsuarios from "../pages/private/listarUsuarios";
import Modificar_curso from "../pages/private/modificar_curso";
import Modificar_lecciones from "../pages/private/modificar_lecciones";
import Modificar_modulo from "../pages/private/modificar_modulos";
import FormularioModArea from "../pages/private/modificar-area";
import FormularioArea from "../pages/private/nueva-area";
import N_usuario from "../pages/private/nuevo-usuario";
import MiProgreso from "../pages/private/miprogreso";
import SubirContenido from "../pages/private/subircontenido";
import CargaUsuarios from "../pages/private/carga-usuarios";
import UsuariosCurso from "../pages/private/usuarios-curso";
import VerContenido from "../pages/private/ver_contenido";
import DetalleCurso from "../pages/private/vercurso-usuario";
import Vercurso from "../pages/private/vercurso";
import HomeUsuarios from "../pages/private/listado-cursos-usuario";
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
        path="/listado-cursos-usuario"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <HomeUsuarios />
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
        path="/agregar-cursos" //pagina redireccionada
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarCursos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-lecciones/:cursoId/:moduloId" //pagina redireccionada
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarLecciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agregar-modulos/:id" //pagina redireccionada
        element={
          <ProtectedRoute>
            <Navbar />
            <AgregarModulos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asignar-area/:cursoId" //popup
        element={
          <ProtectedRoute>
            <Navbar />
            <AsignarAreaACurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carga-usuarios" //transformar a popup
        element={
          <ProtectedRoute>
            <Navbar />
            <CargaUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-rh" //pagina mandar al nav
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <Navbar />
            <DashboardRRHH />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editar-usuario/:rut" // popup para editar usuario
        element={
          <ProtectedRoute>
            <Navbar />
            <EditarUsuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-cursos" //listado de cursos para administrador// mandar al nav
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoCursos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listar-areas" //areglar modal y que muestre la imagen que ya tiene, no carga imagen si tiene error por no tener imagen xdxd//mandar al nav
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoAreas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listar-usuarios" //mandar al nav
        element={
          <ProtectedRoute>
            <Navbar />
            <ListadoUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/miprogreso" //mandar al nav
        element={
          <ProtectedRoute>
            <Navbar />
            <MiProgreso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-curso/:id" //popup para modificar curso
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_curso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursos/:cursoId/modulos/:moduloId/modificar" //popup para modificar modulo
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_modulo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursos/:cursoId/modulos/:moduloId/modificar_lecciones/:leccionId" //popup para modificar leccion
        element={
          <ProtectedRoute>
            <Navbar />
            <Modificar_lecciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modificar-area/:id" //popup para modificar area
        element={
          <ProtectedRoute>
            <Navbar />
            <FormularioModArea />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nueva-area" //popup para nueva area
        element={
          <ProtectedRoute>
            <Navbar />
            <FormularioArea />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nuevo-usuario" //popup para nuevo usuario, añadir contraseña
        element={
          <ProtectedRoute>
            <Navbar />
            <N_usuario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subir-contenido" //popup para subir contenido desde la leccion
        element={
          <ProtectedRoute>
            <Navbar />
            <SubirContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios-curso/:id" //dashboard de curso viene de dashboard-rh
        element={
          <ProtectedRoute>
            <Navbar />
            <UsuariosCurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ver_contenido/:cursoId/:moduloId/:leccionId" //ver contenido, redireccionado de listadocursos para adm
        element={
          <ProtectedRoute>
            <Navbar />
            <VerContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vercurso-usuario/:id" //redireccionado de listadocursos para usuario
        element={
          <ProtectedRoute>
            <Navbar />
            <DetalleCurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vercurso/:id" //ver curso para adm, arreglar botones, arregalr habilitar deshabilitar el curso
        element={
          <ProtectedRoute>
            <Navbar />
            <Vercurso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vista-perfil-rh/:id" //adm viendo usuario para crear informe // mandar al nav
        element={
          <ProtectedRoute>
            <Navbar />
            <DetalleUsuarioLecciones />
          </ProtectedRoute>
        }
      />
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;
