// =========================================================
// datos-arte.js - Datos propios de la Trivia de arte
// Cada artista y cada obra tiene el nombre de su página en
// Wikipedia en español. Con ese nombre se consulta la API y
// se obtienen la imagen, la descripción y el resumen.
// =========================================================

// Artistas: nombre que se muestra y página de Wikipedia
const ARTISTAS = [
  { nombre: 'Leonardo da Vinci', pagina: 'Leonardo_da_Vinci' },
  { nombre: 'Miguel Ángel', pagina: 'Miguel_Ángel' },
  { nombre: 'Sandro Botticelli', pagina: 'Sandro_Botticelli' },
  { nombre: 'El Bosco', pagina: 'El_Bosco' },
  { nombre: 'Rembrandt', pagina: 'Rembrandt' },
  { nombre: 'Johannes Vermeer', pagina: 'Johannes_Vermeer' },
  { nombre: 'Diego Velázquez', pagina: 'Diego_Velázquez' },
  { nombre: 'Francisco de Goya', pagina: 'Francisco_de_Goya' },
  { nombre: 'Eugène Delacroix', pagina: 'Eugène_Delacroix' },
  { nombre: 'Théodore Géricault', pagina: 'Théodore_Géricault' },
  { nombre: 'Claude Monet', pagina: 'Claude_Monet' },
  { nombre: 'Vincent van Gogh', pagina: 'Vincent_van_Gogh' },
  { nombre: 'Paul Cézanne', pagina: 'Paul_Cézanne' },
  { nombre: 'Edvard Munch', pagina: 'Edvard_Munch' },
  { nombre: 'Gustav Klimt', pagina: 'Gustav_Klimt' },
  { nombre: 'Henri Matisse', pagina: 'Henri_Matisse' },
  { nombre: 'Pablo Picasso', pagina: 'Pablo_Picasso' },
  { nombre: 'Salvador Dalí', pagina: 'Salvador_Dalí' },
  { nombre: 'Joan Miró', pagina: 'Joan_Miró' },
  { nombre: 'René Magritte', pagina: 'René_Magritte' },
  { nombre: 'Vasili Kandinski', pagina: 'Vasili_Kandinski' },
  { nombre: 'Piet Mondrian', pagina: 'Piet_Mondrian' },
  { nombre: 'Jackson Pollock', pagina: 'Jackson_Pollock' },
  { nombre: 'Andy Warhol', pagina: 'Andy_Warhol' },
  { nombre: 'Katsushika Hokusai', pagina: 'Katsushika_Hokusai' },
  { nombre: 'Yayoi Kusama', pagina: 'Yayoi_Kusama' },
  { nombre: 'Louise Bourgeois', pagina: 'Louise_Bourgeois' },
  { nombre: 'Frida Kahlo', pagina: 'Frida_Kahlo' },
  { nombre: 'Diego Rivera', pagina: 'Diego_Rivera' },
  { nombre: 'Remedios Varo', pagina: 'Remedios_Varo' },
  { nombre: 'Rufino Tamayo', pagina: 'Rufino_Tamayo' },
  { nombre: 'Fernando Botero', pagina: 'Fernando_Botero' },
  { nombre: 'Tarsila do Amaral', pagina: 'Tarsila_do_Amaral' },
  { nombre: 'Roberto Matta', pagina: 'Roberto_Matta' },
  { nombre: 'Joaquín Torres García', pagina: 'Joaquín_Torres_García' },
  { nombre: 'Pedro Figari', pagina: 'Pedro_Figari' },
  { nombre: 'Benito Quinquela Martín', pagina: 'Benito_Quinquela_Martín' },
  { nombre: 'Xul Solar', pagina: 'Xul_Solar' },
  { nombre: 'Emilio Pettoruti', pagina: 'Emilio_Pettoruti' },
  { nombre: 'Antonio Berni', pagina: 'Antonio_Berni' },
  { nombre: 'Raquel Forner', pagina: 'Raquel_Forner' },
  { nombre: 'Lucio Fontana', pagina: 'Lucio_Fontana' },
  { nombre: 'León Ferrari', pagina: 'León_Ferrari' },
  { nombre: 'Marta Minujín', pagina: 'Marta_Minujín' },
  { nombre: 'Rafael Lozano-Hemmer', pagina: 'Rafael_Lozano-Hemmer' }
];

// Obras: página de Wikipedia de la obra y nombre del artista que la hizo
// (el nombre tiene que ser igual al de la lista ARTISTAS)
const OBRAS = [
  { pagina: 'La_Gioconda', artista: 'Leonardo da Vinci' },
  { pagina: 'La_última_cena_(Leonardo)', artista: 'Leonardo da Vinci' },
  { pagina: 'La_creación_de_Adán', artista: 'Miguel Ángel' },
  { pagina: 'El_nacimiento_de_Venus_(Botticelli)', artista: 'Sandro Botticelli' },
  { pagina: 'El_jardín_de_las_delicias', artista: 'El Bosco' },
  { pagina: 'La_ronda_de_noche', artista: 'Rembrandt' },
  { pagina: 'La_joven_de_la_perla', artista: 'Johannes Vermeer' },
  { pagina: 'Las_meninas', artista: 'Diego Velázquez' },
  { pagina: 'El_tres_de_mayo_de_1808_en_Madrid', artista: 'Francisco de Goya' },
  { pagina: 'Saturno_devorando_a_su_hijo', artista: 'Francisco de Goya' },
  { pagina: 'La_libertad_guiando_al_pueblo', artista: 'Eugène Delacroix' },
  { pagina: 'La_balsa_de_la_Medusa', artista: 'Théodore Géricault' },
  { pagina: 'Impresión,_sol_naciente', artista: 'Claude Monet' },
  { pagina: 'La_noche_estrellada', artista: 'Vincent van Gogh' },
  { pagina: 'Los_comedores_de_patatas', artista: 'Vincent van Gogh' },
  { pagina: 'El_grito', artista: 'Edvard Munch' },
  { pagina: 'El_beso_(Klimt)', artista: 'Gustav Klimt' },
  { pagina: 'Guernica_(cuadro)', artista: 'Pablo Picasso' },
  { pagina: 'Las_señoritas_de_Avignon', artista: 'Pablo Picasso' },
  { pagina: 'La_persistencia_de_la_memoria', artista: 'Salvador Dalí' },
  { pagina: 'La_traición_de_las_imágenes', artista: 'René Magritte' },
  { pagina: 'El_hijo_del_hombre', artista: 'René Magritte' },
  { pagina: 'La_gran_ola_de_Kanagawa', artista: 'Katsushika Hokusai' },
  { pagina: 'Las_dos_Fridas', artista: 'Frida Kahlo' },
  { pagina: 'Abaporu', artista: 'Tarsila do Amaral' },
  { pagina: 'Manifestación_(Berni)', artista: 'Antonio Berni' }
];
