import { asset } from "@/lib/asset";
export type ProjectDevice = "laptop" | "phone";

export type Project = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  shots: string[];
  device?: ProjectDevice;
};

export const projects: Project[] = [
  {
    id: 1,
    name: "Drustex Library",
    tagline: "Online bookshop",
    description:
      "An online bookshop built on a PHP back end, where visitors browse a curated catalogue, search by title, author or genre, and collect titles in a persistent cart that carries through to an itemised checkout summary. A restricted administration panel sits behind the storefront and manages brands, categories, products, registered accounts and order records, while account sessions keep customer and administrator privileges separate. The interface is composed on a responsive Bootstrap grid so the catalogue, cart and admin tables stay legible from desktop down to mobile widths.",
    tech: ["HTML", "CSS", "Bootstrap", "PHP"],
    shots: [
      asset("assets/images/projects/drustex-library/01.jpg"),
      asset("assets/images/projects/drustex-library/02.jpg"),
      asset("assets/images/projects/drustex-library/03.png"),
      asset("assets/images/projects/drustex-library/04.png"),
      asset("assets/images/projects/drustex-library/05.png"),
      asset("assets/images/projects/drustex-library/06.png"),
    ],
  },
  {
    id: 2,
    name: "Hospital Management System",
    tagline: "Doctor and patient communication",
    description:
      "A role-based clinical portal that gives patients, doctors and administrators three distinct entry points into one shared appointment and records system. Patients request consultations by selecting a doctor, date and time slot, then follow the status of those requests and read published reports from a personal dashboard; doctors work through their own patient list, visit history and schedule; administrators supervise the platform through summary metrics, appointment queues, report archives and full user management. Every appointment moves through pending, confirmed, completed and cancelled states, and each transition is reflected consistently across all three roles.",
    tech: ["HTML", "CSS", "Bootstrap", "JavaScript", "PHP"],
    shots: [
      asset("assets/images/projects/hospital/01.jpg"),
      asset("assets/images/projects/hospital/02.png"),
      asset("assets/images/projects/hospital/03.png"),
      asset("assets/images/projects/hospital/04.png"),
      asset("assets/images/projects/hospital/05.png"),
      asset("assets/images/projects/hospital/06.png"),
      asset("assets/images/projects/hospital/07.png"),
      asset("assets/images/projects/hospital/08.png"),
      asset("assets/images/projects/hospital/09.png"),
      asset("assets/images/projects/hospital/10.png"),
      asset("assets/images/projects/hospital/11.png"),
      asset("assets/images/projects/hospital/12.png"),
    ],
  },
  {
    id: 3,
    name: "ArtistWork",
    tagline: "Art encyclopaedia",
    description:
      "An encyclopaedic reference site for classical painting, structured as a museum walkthrough rather than a list of articles. Each entry pairs a full-bleed reproduction with an annotated panel covering the artist, the date of the work and the historical episode behind it, and the site extends past the gallery into a painting course section, a video library on art history, and a validated registration and contact form. Navigation, gallery transitions and form validation are handled in JavaScript over a Bootstrap layout, with typography and dark framing chosen to keep attention on the artwork itself.",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    shots: [
      asset("assets/images/projects/artistwork/01.jpg"),
      asset("assets/images/projects/artistwork/02.jpg"),
      asset("assets/images/projects/artistwork/03.jpg"),
      asset("assets/images/projects/artistwork/04.jpg"),
      asset("assets/images/projects/artistwork/05.jpg"),
      asset("assets/images/projects/artistwork/06.jpg"),
      asset("assets/images/projects/artistwork/07.jpg"),
    ],
  },
  {
    id: 4,
    name: "Kaqi Air Quality",
    tagline: "LoRaWAN environmental monitoring",
    description:
      "A Flutter mobile client for the KAQI air-quality network, fed in real time by the kaqi.krd API that aggregates readings from LoRaWAN sensors across Kurdistan. Operators and residents can filter by city (Sulaimani, Erbil, or the full region), inspect colour-coded station markers on an interactive map, and review AQI rankings from best to worst. Dedicated screens surface live sensor cards—AQI, PM2.5, PM10, temperature, humidity and pressure—alongside bilingual English and Kurdish interfaces, push-notification controls, and a levels guide that maps each metric onto health bands so readings stay actionable rather than abstract.",
    tech: ["Flutter", "Dart", "LoRaWAN", "REST API"],
    device: "phone",
    shots: [
      asset("assets/images/projects/kaqi/01.png"),
      asset("assets/images/projects/kaqi/02.png"),
      asset("assets/images/projects/kaqi/03.png"),
      asset("assets/images/projects/kaqi/04.png"),
      asset("assets/images/projects/kaqi/05.png"),
      asset("assets/images/projects/kaqi/06.png"),
      asset("assets/images/projects/kaqi/07.png"),
      asset("assets/images/projects/kaqi/08.png"),
      asset("assets/images/projects/kaqi/09.png"),
      asset("assets/images/projects/kaqi/10.png"),
      asset("assets/images/projects/kaqi/11.png"),
      asset("assets/images/projects/kaqi/12.png"),
      asset("assets/images/projects/kaqi/13.png"),
      asset("assets/images/projects/kaqi/14.png"),
      asset("assets/images/projects/kaqi/15.png"),
      asset("assets/images/projects/kaqi/16.png"),
      asset("assets/images/projects/kaqi/17.png"),
      asset("assets/images/projects/kaqi/18.png"),
    ],
  },
];
