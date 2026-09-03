![](./image2.png){width="4.639583333333333in"
height="3.207638888888889in"}

#  {#section .unnumbered}

#  {#section-1 .unnumbered}

#  {#section-2 .unnumbered}

![](./image1.png){width="1.2548611111111112in" height="2.2in"}

#  {#section-3 .unnumbered}

Copyright@2026

Version 1.0

Published in May, 2026

Documentation & Designed:

Regional Integrated Multi-Hazard Early Warning System (RIMES)

Asian Institute of Technology campus

PO Box 4 Klong Luang, Pathumthani

12120 Thailand. Email:

rimes@rimes.int

***Table of Contents***

[List of Figures 4](#list-of-figures)

[Executive Summary 5](#executive-summary)

[Key Features of iRAINS 6](#key-features-of-irains)

[Introduction 8](#introduction)

[iRAINS Overview 8](#irains-overview)

[iRAINS Sub-Sections 9](#irains-sub-sections)

> [I. Rainfall Map 10](#rainfall-map)
>
> [II. IRANS Dashboard 11](#irans-dashboard)
>
> [III. Rainfall Graphs 13](#rainfall-graphs)
>
> [IV. NWP Rainfall Products 14](#nwp-rainfall-products)
>
> [V. Rainfall Statistics 16](#rainfall-statistics)
>
> [VI. Rainfall Departures 18](#rainfall-departures)
>
> [VII. QPF Verification Report 20](#qpf-verification-report)
>
> [VIII. Rainfall Reports 21](#rainfall-reports)
>
> [IX. Spatial Distribution 23](#spatial-distribution)
>
> [X. Monsoon Activity 24](#monsoon-activity)
>
> [XI. Data Entry 26](#data-entry)
>
> [XII. Significant Rainfall 27](#significant-rainfall)
>
> [XIII. Verification HQ 29](#verification-hq)
>
> [XIV. Verification MC 29](#verification-mc)
>
> [XV. Station Statistics 30](#station-statistics)
>
> [XVI. Yearly Station Statistics 30](#yearly-station-statistics)
>
> [XVII. Log Info 31](#log-info)
>
> [XVIII. Dissemination 31](#dissemination)

# ***List of Figures*** {#list-of-figures .unnumbered}

| Figure No. | Caption |
|---|---|
| Figure 1 | iRAINS Rainfall Map – Daily Actual Rainfall View at State Level |
| Figure 2 | iRAINS Rainfall Map – Weekly Departure Map at District Level (Pan India) |
| Figure 3 | iRAINS Rainfall Map – Geographic Level and Filter Panel |
| Figure 4 | iRAINS Rainfall Map – Station Coverage Statistics Panel |
| Figure 5 | iRAINS Dashboard – Main Interface Overview |
| Figure 6 | iRAINS Dashboard – Interactive Choropleth Map at Subdivision Level |
| Figure 7 | iRAINS Dashboard – Rainfall Statistics and Charts Panel |
| Figure 8 | iRAINS Dashboard – Comparison Mode View |
| Figure 9 | iRAINS Rainfall Graphs – Seasonal Graph View |
| Figure 10 | iRAINS NWP Rainfall Products – Model Forecast Map |
| Figure 11 | iRAINS NWP Rainfall Products – Probabilistic QPF (PQPF) View |
| Figure 12 | iRAINS Rainfall Statistics – Category Distribution Table |
| Figure 13 | iRAINS Rainfall Departures – Weekly Departure Table |
| Figure 14 | iRAINS Rainfall Departures – Cumulative Departure Table |
| Figure 15 | iRAINS QPF Verification Report – Archive View |
| Figure 16 | iRAINS Rainfall Reports – Subdivision Summary Table |
| Figure 17 | iRAINS Rainfall Reports – Spatial Rainfall Distribution Map |
| Figure 18 | iRAINS Spatial Distribution – Classification Table View |
| Figure 19 | iRAINS Spatial Distribution – Distribution Map |
| Figure 20 | iRAINS Monsoon Activity – Activity Classification Map |
| Figure 21 | iRAINS Monsoon Activity – Tabular Summary |
| Figure 22 | iRAINS Data Entry – Station Filter and Inline Data Entry Table |
| Figure 23 | iRAINS Data Entry – Bulk Upload Interface |
| Figure 24 | iRAINS Data Entry – Station Management Panel (HQ) |
| Figure 25 | iRAINS Significant Rainfall – Threshold Filter and Results Table |
| Figure 26 | iRAINS Verification HQ – Daily Verification Status Table |
| Figure 27 | iRAINS Verification HQ – Cumulative Verification Summary |
| Figure 28 | iRAINS Verification MC – Station Verification Status Panel |
| Figure 29 | iRAINS Station Statistics – Interactive Map with Station Markers |
| Figure 30 | iRAINS Station Statistics – 30-Day Trend Graph |
| Figure 31 | iRAINS Station Statistics – Nearby Station Comparison View |
| Figure 32 | iRAINS Yearly Station Statistics – Station × Date Matrix Export |
| Figure 33 | iRAINS Log Info – Station Change Log |
| Figure 34 | iRAINS Dissemination – Compose and Send Panel |
| Figure 35 | iRAINS Dissemination – Email Log Viewer |
| Figure 36 | iRAINS Data Flow – Station to National Aggregation Pipeline |
| Figure 37 | iRAINS System Architecture – Component Overview Diagram |
| Figure 38 | iRAINS Operational Calendar – Annual Monitoring Cycle |
| Figure 39 | iRAINS Daily Update Cycle – 11:30 IST First Aggregation and Half-Hourly Refresh |
| Figure 40 | iRAINS User Role Hierarchy – HQ / MC / RMC / SP |
| Figure 41 | iRAINS Verification Workflow – Two-Stage MC + HQ Flow |
| Figure 42 | iRAINS Rainfall Map – Block-Level View |
| Figure 43 | iRAINS Rainfall Map – MC/RMC Regional Map View |
| Figure 44 | iRAINS Station Statistics – Polygon Area Selection |
| Figure 45 | iRAINS Yearly Station Statistics – IMD vs State AWS Tab |
| Figure 46 | iRAINS NWP Rainfall Products – River Basin View |
| Figure 47 | iRAINS QPF Verification Report – FMO Report View |
| Figure 48 | iRAINS Rainfall Statistics – District-Level Category Table |
| Figure 49 | iRAINS Monsoon Activity – 7-Day Trend Chart |
| Figure 50 | iRAINS Dissemination – Recipient Group Management |

# ***List of Tables*** {#list-of-tables .unnumbered}

| Table No. | Caption |
|---|---|
| [Table 1](#table-1) | Rainfall Departure Classification Categories |
| [Table 2](#table-2) | Rainfall Map – User Access and Roles |
| [Table 3](#table-3) | iRAINS Dashboard – Rainfall Departure Classification |
| [Table 4](#table-4) | iRAINS Dashboard – User Access and Roles |
| [Table 5](#table-5) | Rainfall Graphs – User Access and Roles |
| [Table 6](#table-6) | NWP Model Products Available in iRAINS |
| [Table 7](#table-7) | NWP Rainfall Products – User Access and Roles |
| [Table 8](#table-8) | Rainfall Statistics – Departure Category Classification |
| [Table 9](#table-9) | Rainfall Statistics – User Access and Roles |
| [Table 10](#table-10) | Rainfall Departures – Colour-Coded Category Classification |
| [Table 11](#table-11) | Rainfall Departures – User Access and Roles |
| [Table 12](#table-12) | QPF Verification Report – User Access and Roles |
| [Table 13](#table-13) | Rainfall Reports – Departure Category Classification |
| [Table 14](#table-14) | Rainfall Reports – User Access and Roles |
| [Table 15](#table-15) | Spatial Distribution Classification Criteria |
| [Table 16](#table-16) | Spatial Distribution – User Access and Roles |
| [Table 17](#table-17) | Monsoon Activity Classification Criteria |
| [Table 18](#table-18) | Monsoon Activity – User Access and Roles |
| [Table 19](#table-19) | Data Entry – User Access and Roles |
| [Table 20](#table-20) | Significant Rainfall – User Access and Roles |
| [Table 21](#table-21) | Verification HQ – User Access and Roles |
| [Table 22](#table-22) | Verification MC – User Access and Roles |
| [Table 23](#table-23) | Station Statistics – Rainfall Intensity Classification |
| [Table 24](#table-24) | Station Statistics – User Access and Roles |
| [Table 25](#table-25) | Yearly Station Statistics – User Access and Roles |
| [Table 26](#table-26) | Log Info – User Access and Roles |
| [Table 27](#table-27) | Dissemination – User Access and Roles |
| [Table 28](#table-28) | G.5a Daily Data Refresh Schedule |
| [Table 29](#table-29) | G.5a Data Refresh Configuration Parameters |
| [Table 30](#table-30) | H.1 Departure Formula — Special Cases |
| [Table 31](#table-31) | H.2 District Aggregation Inputs |
| [Table 32](#table-32) | H.3 State Area-Weighted Average Inputs |
| [Table 33](#table-33) | H.4 Subdivision Special Districts Exception |
| [Table 34](#table-34) | H.5 Region Subdivision-Weighted Average |
| [Table 35](#table-35) | H.6 Country Triple-Nested Average |
| [Table 36](#table-36) | H.7 Monsoon Activity Classification Thresholds |
| [Table 37](#table-37) | H.8 Spatial Distribution Thresholds |
| [Table 38](#table-38) | H.9 Season Boundary Reference |
| [Table 39](#table-39) | H.10 IMD Standard Week Definition |
| [Table 40](#table-40) | N.1 Meteorological Terms Glossary |
| [Table 41](#table-41) | N.2 Rainfall Classification and Statistical Terms |
| [Table 42](#table-42) | N.3 Technical and System Terms |
| [Table 43](#table-43) | N.4 IMD Organizational and Geographic Terms |
| [Table 44](#table-44) | O.1 Login and Access Issues |
| [Table 45](#table-45) | O.2 Data Entry Issues |
| [Table 46](#table-46) | O.3 Map and Visualization Issues |
| [Table 47](#table-47) | O.4 Chart and Export Issues |
| [Table 48](#table-48) | O.5 Email and Dissemination Issues |
| [Table 49](#table-49) | O.6 Verification Issues |
| [Table 50](#table-50) | O.7 Performance Issues |
| [Table 51](#table-51) | P.1 Daily Update Schedule |
| [Table 52](#table-52) | P.2 Departure Category Quick Reference |
| [Table 53](#table-53) | P.3 Monsoon Activity Quick Reference |
| [Table 54](#table-54) | P.4 Spatial Distribution Quick Reference |
| [Table 55](#table-55) | P.5 IMD Rainfall Intensity Classification |
| [Table 56](#table-56) | P.6 Season Boundaries Quick Reference |
| [Table 57](#table-57) | P.7 Module Selection Guide |
| [Table 58](#table-58) | P.8 User Role Capability Summary |
| [Table 59](#table-59) | P.9 Key Database Tables Quick Reference |
| [Table 60](#table-60) | Q.1 Station Types in iRAINS |
| [Table 61](#table-61) | Q.2 Station Code Structure |
| [Table 62](#table-62) | Q.3 National Station Coverage |
| [Table 63](#table-63) | Q.4 Data Completeness Expectations |
| [Table 64](#table-64) | Q.5 Sentinel Value Policy |
| [Table 65](#table-65) | Q.6 Station Coordinates and Geographic Assignment |
| [Table 66](#table-66) | R.1 NWP Model Descriptions |
| [Table 67](#table-67) | R.2 Model Technical Specifications |
| [Table 68](#table-68) | R.3 Model Availability Times |
| [Table 69](#table-69) | R.4 View Types in iRAINS |
| [Table 70](#table-70) | R.5 PQPF Thresholds |
| [Table 71](#table-71) | R.6 Model Selection Guidance |
| [Table 72](#table-72) | T.1 IMD Region Reference |
| [Table 73](#table-73) | T.3 Standard Week Reference |
| [Table 74](#table-74) | T.4 Key River Basins |
| [Table 75](#table-75) | T.5 Special Districts Exception |
| [Table 76](#table-76) | U.1 Document Revision Log |
| [Table 77](#table-77) | U.2 Planned Future Revisions |
| [Table 78](#table-78) | V.1 Monthly Operational Activity Guide |
| [Table 79](#table-79) | V.2 Key Annual Milestones |
| [Table 80](#table-80) | V.3 Seasonal Reporting Deliverables |
| [Table 81](#table-81) | W.2 Role-Based Access Control Summary |
| [Table 82](#table-82) | W.4 Password Security Policy |
| [Table 83](#table-83) | X.1 Critical Data Assets |
| [Table 84](#table-84) | X.2 Recommended Backup Schedule |
| [Table 85](#table-85) | X.4 Data Consistency Checks After Recovery |
| [Table 86](#table-86) | Y.1 Issue Escalation Matrix |
| [Table 87](#table-87) | Z Executive Summary – User Groups |
| [Table 88](#table-88) | Z Executive Summary – Key Capabilities |
| [Table 89](#table-89) | Z.1 Summary of Document Contents |

---

# ***Executive Summary*** {#executive-summary .unnumbered}

The IMD RAinfall INformation System (iRAINS) is a centralized, web-based
rainfall data management platform developed by the IMD RIMES Unit (IRU)
for the Hydromet Division of the India Meteorological Department (IMD),
under the guidance of the Director General of Meteorology. Designed to
modernize and streamline rainfall monitoring and analysis across India,
iRAINS provides an integrated solution for the collection, verification,
visualization, analysis, and dissemination of rainfall information at
district, state, subdivision, regional, and national levels.

The system serves as a comprehensive operational platform for
Headquarters (HQ), Meteorological Centres (MCs), and Regional
Meteorological Centres (RMCs), enabling users to efficiently manage
rainfall observations from multiple meteorological stations through an
intuitive and interactive interface. By combining real-time data
handling, map-based visualization, automated workflows, and statistical
reporting capabilities, iRAINS significantly enhances the efficiency,
transparency, and reliability of rainfall data operations within IMD.

Built using modern web technologies and interactive GIS-based mapping
tools, iRAINS allows users to visualize rainfall distribution through
color-coded maps displaying Actual, Normal, and Departure rainfall
values. The platform supports station-level data entry, verification
workflows, historical rainfall analysis, comparative statistics, and
dissemination of rainfall information through automated email systems.

The system also provides advanced analytical capabilities, including
graphical representations, significant rainfall filtering, station
comparison tools, and yearly station statistics, thereby supporting
operational forecasting, climate analysis, and decision-making
processes. Automated notification mechanisms help ensure timely data
updates and verification by alerting concerned offices regarding pending
observations or validation requirements.

With scalable architecture and user-friendly design, iRAINS strengthens
IMD's capability to provide accurate, accessible, and actionable
rainfall information for operational meteorology, hydrology, climate
monitoring, and disaster risk management activities across the country.

# ***Key Features of iRAINS*** {#key-features-of-irains .unnumbered}

1.  **Interactive Rainfall Visualization**

-   Web-based interactive maps using GIS technology and Leaflet.

-   Color-coded rainfall representation for:

    -   Actual Rainfall

    -   Normal Rainfall

    -   Departure from Normal

-   Visualization available at:

    -   District level

    -   State level

    -   Subdivision level

    -   Regional and National level

-   Supports quick assessment of rainfall distribution and trends.

**2. Real-Time Rainfall Data Management**

-   Centralized collection and management of rainfall observations.

-   Supports real-time and daily rainfall data updates.

-   Enables efficient monitoring of rainfall conditions across India.

**3. Station-Level Data Entry and Verification**

-   MC and RMC users can enter and update station rainfall data.

-   HQ users can verify, review, and validate submitted observations.

-   Ensures data consistency, completeness, and operational reliability.

**4. Advanced Statistical Analysis**

-   Provides rainfall statistics in graphical and tabular formats.

-   Supports historical rainfall analysis and trend assessment.

-   Includes comparative analysis between stations and regions.

**5. Significant Rainfall Analysis**

-   Users can define threshold rainfall values.

-   Filters stations and regions based on selected rainfall ranges.

-   Helps identify significant rainfall events quickly.

**6. Automated Notification System**

-   Automatically sends reminder emails for:

    -   Pending rainfall data updates

    -   Verification requirements

-   Improves coordination between HQ, MCs, and RMCs.

**7. Dissemination Module**

-   Integrated email dissemination system.

-   Supports sending rainfall reports and attachments.

-   Maintains email logs and recipient group management.

**8. Station Mapping and Comparison Tools**

-   Displays rainfall stations on interactive maps.

-   Allows comparison with nearby stations.

-   Provides 30-day running rainfall graphs for stations.

**9. Historical and Yearly Rainfall Statistics**

-   Access to yearly station-wise rainfall datasets.

-   Unified downloadable data formats for reporting and analysis.

-   Supports operational and climatological studies.

**10. Download and Reporting Capabilities**

-   Download maps, graphs, and tables in user-friendly formats.

-   Facilitates preparation of operational reports and documentation.

**11. Multi-Level Administrative Access**

-   Role-based access for:

    -   Headquarters (HQ)

    -   Meteorological Centres (MCs)

    -   Regional Meteorological Centres (RMCs)

-   Ensures secure and organized data management workflows.

**12. Scalable and User-Friendly Architecture**

-   Designed to handle large-scale national rainfall datasets.

-   Intuitive interface for operational users.

-   Supports efficient navigation and data accessibility.

**13. Support for Operational Meteorology**

-   Assists rainfall monitoring, hydrological assessment, forecasting
    > support, and climate analysis.

-   Enhances IMD's operational decision-making and data dissemination
    > processes.

# ***Introduction*** {#introduction .unnumbered}

## **Background and Context**

The India Meteorological Department (IMD) is India's national meteorological service and is responsible for weather observation, analysis, forecasting, and climate services across the country. Founded in 1875, IMD operates a vast network of surface and upper-air observation stations, automatic weather stations, Doppler weather radars, and satellite-based remote sensing systems. Within IMD, the Hydromet Division — headquartered at Mausam Bhawan, New Delhi — is specifically responsible for the collection, processing, quality control, and dissemination of hydrometeorological data, with a primary focus on rainfall observations that are critical to flood forecasting, agricultural planning, water resource management, and disaster preparedness.

Rainfall is arguably the most socioeconomically consequential meteorological variable in India. The country's agriculture, which supports approximately half the national workforce, is critically dependent on the timing, amount, and spatial distribution of the Southwest Monsoon (June–September) and Northeast Monsoon (October–December). Extreme rainfall events — whether prolonged deficits that trigger agricultural drought or intense episodes that cause flash flooding — have direct and severe consequences for millions of people across the country. Accurate, timely, and accessible rainfall data is therefore not merely a scientific requirement but a matter of national importance.

Prior to the development of iRAINS, rainfall data management within IMD's Hydromet Division relied on a combination of legacy systems, manual processes, and spreadsheet-based workflows. While these processes fulfilled basic data archival requirements, they presented limitations in terms of near-real-time data accessibility, interactive visualization, cross-level aggregation, and systematic quality verification. Operational meteorologists at IMD Headquarters and at regional centres required a unified, modern platform that could consolidate data from thousands of stations, perform standardized calculations, and present the results in an accessible and actionable format.

## **Project Origin and Development**

The IMD RAinfall INformation System (iRAINS) was conceived and developed in response to these operational requirements. The system was built by the IMD RIMES Unit (IRU) — a collaborative technical cell established through a partnership between the India Meteorological Department and the Regional Integrated Multi-Hazard Early Warning System for Africa and Asia (RIMES), hosted at the Asian Institute of Technology campus in Pathumthani, Thailand. RIMES provides technical expertise in hydrometeorological information systems and early warning infrastructure across Asia and Africa, and its collaboration with IMD through the IRU represents a focused effort to strengthen India's hydromet data management capabilities.

The development of iRAINS was conducted under the direct guidance and supervision of the Director General of Meteorology, IMD, and in close coordination with the Hydromet Division at Mausam Bhawan. The development team engaged operational forecasters, data managers, and scientific staff throughout the design and implementation process to ensure that the platform's features, workflows, and outputs aligned precisely with the operational requirements of IMD's daily monitoring and analysis activities.

Version 1.0 of iRAINS was released in May 2026, representing the initial full-featured deployment of the platform across IMD's Headquarters and all Meteorological Centres and Regional Meteorological Centres.

## **Role within IMD Operations**

iRAINS operates as the central operational platform for daily rainfall data management within IMD's Hydromet Division. Its role in the operational chain can be described as follows:

**Data Collection Hub:** iRAINS receives daily rainfall observations submitted by MC and RMC staff from meteorological stations across India. These observations originate from a network that includes Ordinary Rain Gauge (ORG) stations, Automatic Rain Gauge (ARG) stations, and Automatic Weather Stations (AWS). The data entry and bulk upload capabilities of iRAINS ensure that these readings are consolidated into a single, managed database accessible to all levels of the organisation.

**Quality and Verification Gateway:** Before rainfall data can be used for official products and reports, it passes through the iRAINS two-stage verification process: initial review by the responsible MC or RMC, followed by formal verification by HQ meteorologists. This structured quality gate reduces the risk of erroneous observations propagating into official products.

**Aggregation and Analysis Engine:** iRAINS applies IMD's standardized multi-level aggregation methodology — averaging station readings to district level, then applying area-weighted averaging to state, subdivision, and region levels — to compute officially recognized rainfall figures at each administrative scale. These aggregated values are the basis for all departure calculations, statistical summaries, and official rainfall assessments.

**Visualization and Monitoring Platform:** Through its interactive map, dashboard, statistical charts, and departure tables, iRAINS provides operational meteorologists with the spatial and temporal context needed to characterize rainfall conditions quickly and accurately at any point during the monitoring cycle.

**Official Reporting and Dissemination System:** The PDF report generation and email dissemination capabilities of iRAINS support the preparation and distribution of official rainfall products — bulletins, statistical reports, and distribution maps — to internal IMD offices and external stakeholders.

## **Scope and Coverage**

iRAINS covers the entire territory of India at the following administrative and meteorological levels:

**Administrative Levels:** Village Block, District, State, Meteorological Subdivision, Homogeneous Region, and Country (All-India). Each level is supported by pre-stored normal rainfall values and geographic boundary data for map rendering.

**Meteorological Network:** The system supports all meteorological station types used by IMD: Ordinary Rain Gauges (ORG), Automatic Rain Gauges (ARG), and Automatic Weather Stations (AWS). The geographic coverage extends across all 36 States and Union Territories of India.

**Temporal Coverage:** iRAINS supports daily, weekly, monthly, seasonal, and annual rainfall analysis. The four meteorological seasons — Winter (January–February), Pre-Monsoon (March–May), Southwest Monsoon (June–September), and Post-Monsoon / Northeast Monsoon (October–December) — are explicitly defined within the system and used to organize seasonal analysis and reporting.

**Institutional Coverage:** The system serves all levels of IMD's organizational hierarchy — the national Headquarters (HQ) at Mausam Bhawan, the 14 Meteorological Centres (MCs), and 4 Regional Meteorological Centres (RMCs) distributed across the country. SP (State and Sub-district Planners) users with read-only access are also accommodated.

## **Design Philosophy**

The design of iRAINS was guided by several core principles that reflect the operational environment and user base of the system:

**Operational Reliability First:** The system is designed to handle the daily data entry and verification workload reliably under all normal operating conditions. Robustness of core data flows — entry, validation, storage, aggregation — was prioritized over aesthetic complexity.

**Scientist and Forecaster Orientation:** The interface and outputs are designed for use by trained meteorologists and scientific staff, not general public users. Feature depth is valued over simplicity. Users are assumed to understand IMD's classification systems, departure definitions, and seasonal frameworks, and the system does not over-explain these standard concepts within the interface itself.

**Standardization of Calculations:** All aggregation formulas, departure calculations, and threshold classifications within iRAINS follow IMD's officially adopted standards. This ensures that values generated by the system are directly comparable with historical and externally published IMD figures, and that no ambiguity exists regarding the basis of any reported value.

**Multi-Role Security:** The system enforces a role-based access model that reflects the real organizational hierarchy of IMD. Data entry is confined to the centres responsible for the relevant stations; verification is a separate action available only to designated HQ staff; and administrative capabilities such as station management and audit log access are restricted to HQ administrators. This security model protects data integrity while enabling the broad range of viewing and analytical functions that all user levels require.

**Minimal Infrastructure Dependencies:** iRAINS is designed to operate effectively within the network and infrastructure environment typical of government meteorological offices, which may have limited bandwidth and varying hardware configurations. The single-page Angular application minimises page-load overhead, and server-side PDF generation reduces client-side processing demands.

# ***iRAINS Overview*** {#irains-overview .unnumbered}

iRAINS is a web-based system designed to streamline rainfall data management for the Hydromet Division, Indian Meteorological Department (IMD). This platform employs an interactive, map-centric interface powered by Leaflet, allowing users to visualize rainfall data across districts, states, subdivisions, and regions with color-coded indicators that display actual, normal, and departure values. iRAINS supports detailed station-level data entry, verification, and analysis, enhancing data accuracy and accessibility.

The system is organized into eighteen functional sub-sections, each addressing a distinct operational or analytical need within the rainfall data management lifecycle. Together, these sections cover the complete operational chain from data ingestion to final dissemination: raw station data is entered and verified (Data Entry, Verification HQ, Verification MC), aggregated and visualized spatially (Rainfall Map, Dashboard), analyzed statistically (Rainfall Statistics, Rainfall Departures, Spatial Distribution, Monsoon Activity), compared with numerical forecast guidance (NWP Rainfall Products), subjected to significant-event filtering (Significant Rainfall), reviewed in historical and station-level context (Rainfall Graphs, Station Statistics, Yearly Station Statistics), and finally assembled into formal reports and distributed (Rainfall Reports, QPF Verification Report, Dissemination). System administration and audit capabilities are provided through the Log Info section.

The normal rainfall values against which departures are measured are stored as pre-calculated daily long-period averages at every administrative level. These normals are based on the IMD official climatological reference period and are loaded into the database at system setup. All departure calculations — regardless of geographic level or time period — use these pre-stored values as their reference baseline, ensuring consistency across the system.

**Daily Operational Cycle**

iRAINS operates on a defined daily data refresh cycle. During the morning hours (08:30–11:00 IST), MC and RMC users enter the previous day's 24-hour rainfall observations. The platform performs its first full daily aggregation at **11:30 IST**, when district-level averages are computed and all higher-level aggregations (state, subdivision, region, country) are recalculated. All visualization and statistical modules — Rainfall Map, Dashboard, Rainfall Statistics, Spatial Distribution, Monsoon Activity — first reflect the current day's data at this time. From 11:30 IST onwards, the backend repeats the aggregation cycle **every 30 minutes**, ensuring that any late submissions from centres completing entry after 11:30 are incorporated into the platform progressively throughout the day. For auto-generated daily reports, a data snapshot is taken at **07:50 UTC (13:20 IST)**. Users should interpret data displayed before 11:30 IST as reflecting the previous day's final picture.

iRAINS is deployed as a centrally hosted web application, accessible to authorized users across all IMD offices through a standard web browser. No local software installation is required. Authentication is enforced through a JWT-based login system, and all data access is governed by the user's assigned role as defined in the system's user management configuration.

# ***iRAINS System Architecture*** {#system-architecture .unnumbered}

## **Technology Stack**

iRAINS is built on a modern, scalable web application stack designed to handle real-time national-scale rainfall data operations reliably and efficiently.

**Frontend**

The user interface is developed using **Angular 16**, a TypeScript-based single-page application framework maintained by Google. Angular's component-based architecture allows each iRAINS module (Rainfall Map, Data Entry, Verification, etc.) to be developed, tested, and maintained as an independent unit while sharing a common routing and service layer. The frontend communicates with the backend exclusively through HTTP API calls, maintaining a clean separation between presentation and business logic.

Key frontend libraries include:
- **Leaflet.js** — An open-source JavaScript library for interactive maps. Used in the Rainfall Map, Dashboard, Spatial Distribution, Monsoon Activity, Station Statistics, and Yearly Station Statistics sections to render GeoJSON polygon layers, satellite tile layers, station circle markers, and drawing tools.
- **Angular-Highcharts** — A wrapper for the Highcharts charting library. Used in Rainfall Graphs, Monsoon Activity, Station Statistics, and Yearly Station Statistics for line charts, column charts, pie charts, donut charts, and stacked bar charts.
- **PrimeNG** — An Angular UI component library providing multi-select dropdowns, paginated data tables, calendar pickers, and sortable columns used across the Data Entry, Station Statistics, and Yearly Station Statistics sections.
- **Angular Material** — Google's Material Design component library for Angular, used for date pickers, dialogs, form controls, and tables in the Verification and Dissemination sections.
- **jsPDF** — A client-side PDF generation library used to produce formal rainfall bulletin PDFs, T/P MESSAGE documents, monsoon activity reports, and download documents throughout the application.
- **xlsx-js-style** — An extended version of the SheetJS library supporting styled Excel export (custom fonts, cell colours, and borders). Used in the Yearly Station Statistics, Verification HQ, and Spatial Distribution sections.
- **html-to-image** — A library for capturing DOM elements as high-resolution images, used in the Monsoon Activity map download feature to capture the Leaflet map canvas at 8× resolution before converting to JPEG.
- **leaflet-draw** — A Leaflet plugin enabling user-defined polygon and shape drawing on the map. Used in the Station Statistics section for polygon-based station selection.
- **@turf/turf** — A geospatial analysis library for JavaScript, used alongside leaflet-draw to determine which station points fall within a user-drawn polygon using geometric intersection.

**Backend**

The server-side application is built with **Node.js** and the **Express.js** framework. Express provides the HTTP routing layer, handling all incoming API requests from the Angular frontend and delegating them to the appropriate controller function. Each major domain area (stations, rainfall data, verification, PDF generation, email, etc.) has a dedicated controller file, keeping the codebase modular and maintainable.

Key backend libraries include:
- **pg (node-postgres)** — The official Node.js client for PostgreSQL. All database interactions — queries, upserts, transactions — are performed through the `pg` library using parameterised queries to prevent SQL injection.
- **Multer** — A Node.js middleware for handling multipart/form-data requests, used for processing Excel file uploads in the bulk Data Entry and Station Management features.
- **Nodemailer** — An email sending library for Node.js, used in the Dissemination section to dispatch emails via an SMTP server configured through environment variables.
- **Moment.js** — A date manipulation and formatting library used in the Monsoon Activity backend for date arithmetic, season boundary detection, and date validation.
- **xlsx (SheetJS)** — Used on the backend for parsing uploaded Excel files in bulk data entry workflows.

**Database**

The primary data store is **PostgreSQL**, a robust open-source relational database management system. PostgreSQL was chosen for its strong support for complex analytical queries, its native JSONB data type (used for email group storage), its `generate_series` function (used for producing complete date ranges in cumulative verification queries), and its performance with large time-series datasets.

Key data tables include:
- `station_daily_data_updates` — The primary operational table storing daily rainfall observations with update and verification status flags.
- `station_details` — The master station registry containing geographic, administrative, and instrumentation metadata for every observation station.
- `normal_district`, `normal_state`, `normal_sub_division`, `normal_region`, `normal_country` — Pre-computed climatological normal rainfall reference tables at each administrative level.
- `normal_district_details` — A geographic metadata table linking districts to their parent subdivisions, states, and regions, including district area (km²) and subdivision weight values used in the aggregation formulas.
- `calculation_exclusions` — A configurable exclusion table used by administrators to exclude specific stations, blocks, or districts from the statistical aggregation pipeline.
- `station_logs` — An audit log of all station additions and deletions.
- `data_actions` — A time-stamped log of user actions performed within the system.
- `email_log` — A complete record of all emails sent via the Dissemination module.
- `email_group` — Named distribution groups for email dissemination.

---

## **Rainfall Aggregation Pipeline**

The aggregation pipeline that transforms station-level observations into district, state, subdivision, region, and country-level statistics is the mathematical core of iRAINS. The pipeline operates in four sequential steps:

**Step 1 — Station Level (Raw Data Filtering)**

For each active station and each date in the selected period, the rainfall value is retrieved from `station_daily_data_updates`. Values equal to −999.9 (the sentinel for missing data) and any negative values are treated as null and excluded from averaging. The valid rainfall values for a given day across all stations in a district are averaged.

> **District Daily Average = AVG(valid rainfall values for all stations in the district on date d)**

**Step 2 — District Level (Summation over Period)**

The district-level actual rainfall for the selected date range is the sum of the daily district averages across all days in the range:

> **Actual Rainfall (District) = Σ [District Daily Average] for all days in range**

The normal rainfall for the district is the sum of the pre-stored daily normal reference values from the `normal_district` table for the same date range.

**Step 3 — State and Subdivision Level (Area-Weighted Average)**

State and subdivision-level statistics are computed as area-weighted averages of the constituent district values. The weight for each district is its geographic area in square kilometres, sourced from `normal_district_details.district_area`.

> **Actual Rainfall (State) = Σ (District Actual × District Area) ÷ Σ (District Area)**

A special exception applies for subdivision calculations: districts with codes 30506001 and 30506002 (specific islands) are assigned an area of zero in the subdivision aggregation, effectively excluding their contribution from the weighted average.

**Step 4 — Region and Country Level (Subdivision-Weighted Average)**

Region-level actual rainfall is computed using subdivision weights rather than area weights:

> **Actual Rainfall (Region) = Σ (Subdivision Actual × Subdivision Weight) ÷ Σ (Subdivision Weight)**

Where `Subdivision Weight` is sourced from `normal_district_details.subdiv_weight`.

Country-level (All-India) actual rainfall is then computed as a further weighted average of the region-level values using the same subdivision weight scheme, producing a fully nested three-level weighted aggregation.

**Departure Calculation**

For every geographic unit and every level, the departure from normal is calculated as:

> **Departure (%) = (Actual Rainfall − Normal Rainfall) ÷ Normal Rainfall × 100**

Special handling:
- When Normal Rainfall = 0, the value 0.01 is substituted as the denominator to prevent division by zero.
- When Actual Rainfall = 0, Departure is set to −100% directly (complete deficit).
- When Actual Rainfall is null (no valid data), Departure is returned as null.

---

## **API Architecture**

All communication between the Angular frontend and the Node.js backend follows a RESTful API pattern over HTTPS. API endpoints are prefixed with `/api/v1/` to support versioning and are grouped by functional domain.

**Authentication and Session Management**

User authentication is handled via **JWT (JSON Web Token)**-based sessions. When a user logs in with valid credentials, the server issues a signed JWT containing the user's identity, role (`hq`, `mc`, `rmc`, or `sp`), and centre assignment. The token is stored in `localStorage` on the frontend and included in the `Authorization` header of every subsequent API request.

An **AuthGuard** middleware on the backend validates the JWT on each protected endpoint, rejecting requests with expired or invalid tokens with a 401 Unauthorized response. Route-level guards in Angular prevent unauthorized users from accessing protected views on the frontend.

**Role-Based Access Control**

The iRAINS user role model has four tiers:
- **HQ (Headquarters):** Full national access to all data, all stations, all administrative operations, and all administrative features including station management, verification, and bulk dissemination.
- **MC (Meteorological Centre):** Scoped to the stations and geographic units under the user's assigned Meteorological Centre. Can perform data entry, verification of own stations, and dissemination.
- **RMC (Regional Meteorological Centre):** Similar scope to MC but covering a Regional centre's area.
- **SP (Special Permission):** Read-only access to most visualisation and reporting features; no data entry, verification, or administrative capabilities.

Role assignment is stored in the `login` table (`mcorhq` field) and returned as part of the JWT payload on authentication. All centre-scoped filtering in the frontend reads the role and centre name from `localStorage`.

---

## **Deployment Architecture**

iRAINS is deployed as a web application on an internal IMD server infrastructure. The Angular frontend is compiled into a static bundle of HTML, CSS, and JavaScript files and served by the Node.js Express server as static assets. This configuration allows the same Node.js process to serve both the frontend application and the backend API, simplifying deployment on IMD's internal network.

**Environment Configuration**

All sensitive configuration values — database connection strings, SMTP credentials, JWT secrets, and server ports — are stored in environment variables and loaded from a `.env` file at startup using the `dotenv` library. This ensures that no credentials are hardcoded in the application source code.

**Database Connectivity**

The backend maintains a PostgreSQL connection pool managed by the `pg` library's `Pool` class. Connection pooling minimises latency on high-frequency API calls (such as the station data fetch calls triggered during map loads) by reusing existing database connections rather than establishing a new connection for each request.

---

## **Data Integrity and Quality Controls**

**Sentinel Value Handling**

The value −999.9 is used universally throughout iRAINS as the sentinel for "No Data." This value is assigned when no observation was reported for a station on a given date. All aggregation queries and departure calculations explicitly exclude this value to ensure that missing observations do not distort rainfall averages or totals.

**Input Validation**

The Data Entry section enforces client-side validation rules: rainfall values must be numeric, non-negative, and no greater than 100 mm (with an alert for higher values). Bulk upload files are validated for the presence of the required column headers before processing. Station management forms validate required fields before submission.

**Upsert Mechanism**

All rainfall data writes use PostgreSQL's `INSERT ... ON CONFLICT DO UPDATE` (upsert) mechanism. This ensures that re-submitting data for an already-recorded station–date combination updates the existing record rather than creating a duplicate, maintaining the integrity of the one-record-per-station-per-day rule.

**Verification Workflow**

Data flows through a two-stage quality control workflow: first, MC/RMC users enter and review their own station data; second, HQ users review and verify the data at a national scope. The `is_verified` flag in `station_daily_data_updates` tracks whether a record has passed the HQ verification stage. Verified records can be distinguished from merely updated records throughout the system, providing a data quality signal for downstream analytical products.

---

## **System Monitoring and Health Checks**

iRAINS does not include a built-in system health dashboard. Administrators monitor system health through the following external means:

| Health Check | Method | Recommended Frequency |
|---|---|---|
| Server uptime and CPU usage | Server OS monitoring tools (e.g., `top`, `htop`, `pm2 status`) | Continuous (automated alerts at >80% CPU) |
| PostgreSQL connection pool status | Monitor pool overflow warnings in the Node.js application log | Daily review |
| Disk space for NWP image directory | `df -h /path/to/nwp_assets` | Daily; alert if >85% capacity |
| Application log review | Review `/var/log/irains/app.log` for ERROR-level entries | Daily |
| Failed email delivery | Review Email Log for FAILED status entries | Daily after automated email window |
| Data completeness check | Verification HQ — check Pending count is near zero by end of day | Daily at 14:00 IST |
| Aggregation pipeline freshness | Check Rainfall Map — confirm data reflects today's date after 11:30 IST | Daily at 12:00 IST |

**Application Process Management**

The iRAINS Node.js backend should be managed with a process manager such as **PM2** to ensure automatic restart on crash and to provide log rotation. Key PM2 commands for administrators:

- `pm2 status` — Check whether the iRAINS process is running
- `pm2 logs irains` — View real-time application logs
- `pm2 restart irains` — Restart the application (e.g., after a configuration change)
- `pm2 stop irains` — Gracefully stop the application (e.g., for maintenance)

---

# ***iRAINS Sub-Sections*** {#irains-sub-sections .unnumbered}

The iRAINS platform is organised into multiple integrated sub-sections
that collectively support rainfall data management, monitoring,
analysis, verification, reporting, and dissemination activities across
India. The Dashboard provides a real-time overview of rainfall
conditions through interactive maps, charts, and statistical summaries.
The Rainfall Map and Rainfall Graphs modules enable users to visualise
Actual, Normal, and Departure rainfall patterns across different spatial
and temporal scales using maps and graphical analysis tools. The NWP
Rainfall Products section provides model-based rainfall forecast outputs
from various Numerical Weather Prediction systems, supporting
short-range and medium-range forecasting as well as probabilistic
rainfall assessment. The Rainfall Statistics, Rainfall Departures,
Spatial Distribution, and Monsoon Activity modules support detailed
statistical analysis and classification of rainfall conditions across
states, subdivisions, districts, and regions. The QPF Verification
Report and Rainfall Reports sections provide historical forecast
verification and annual rainfall assessment reports for operational
review and analysis.

The platform also includes operational modules such as Data Entry,
Verification MC, Significant Rainfall, and Station Statistics, which
support station-level rainfall data entry, verification, monitoring, and
analytical comparison. The Yearly Station Statistics section facilitates
extraction of long-term station-wise rainfall datasets in structured
Excel format for reporting and research purposes. Administrative and
governance functionalities are managed through the Log Info section,
which maintains audit trails of system activities and user actions,
while the Dissemination module serves as the communication hub for
sharing rainfall maps, reports, and related information through email.
Together, these sub-sections make iRAINS a comprehensive and centralized
platform for rainfall monitoring, analysis, forecasting support,
operational coordination, and meteorological reporting within the
Hydromet Division of IMD.

## ***Rainfall Map***

> **Purpose**

The Rainfall Map section of iRAINS is designed to provide a
comprehensive geospatial visualization and analytical platform for
monitoring rainfall patterns across India at multiple administrative and
temporal scales. This section enables operational users to view,
analyze, and interpret rainfall information through interactive
GIS-based maps representing Actual, Departure, and Normal rainfall
conditions.

The primary purpose of this module is to support meteorological
monitoring, rainfall assessment, hydrological analysis, and
climate-related decision-making by presenting rainfall data in an
intuitive and spatially organized format. The module facilitates
detailed rainfall analysis at country, region, subdivision, state,
district, and block levels, enabling users to identify rainfall
distribution patterns, anomalies, and trends efficiently.

The Rainfall Map section supports operational workflows by allowing
users to:

-   Monitor real-time and historical rainfall conditions across
    > different geographic regions.

-   Analyze Actual rainfall amounts and Departure from Normal rainfall
    > values.

-   Identify areas experiencing excess, deficient, or significant
    > rainfall events.

-   Compare rainfall distribution across daily, weekly, cumulative,
    > monthly, seasonal, and annual time scales.

-   Access rainfall information at finer administrative levels for
    > localized assessment and reporting.

-   Generate downloadable maps and statistical outputs for operational
    > reporting, documentation, and dissemination purposes.

The module also enhances data accessibility and usability through
interactive controls, customizable filters, and multiple download
options, allowing users to efficiently retrieve and share rainfall
information in standardized formats. By integrating spatial
visualization with statistical analysis, the Rainfall Map section serves
as a critical operational tool for forecasting support, climate
monitoring, disaster preparedness, hydrological assessment, and rainfall
trend analysis within the India Meteorological Department (IMD).

---

**Features**

- Interactive colour-coded maps displaying Actual Rainfall, Normal Rainfall, and Departure from Normal at all administrative levels.
- Multi-level geographic navigation: Country, Region, Subdivision, State, District, and Block.
- Time period options: Daily, Weekly, and Cumulative analyses.
- Regional district maps for five homogeneous zones — Pan India, Central India, North-West India, East & North-East India, and South Peninsula.
- Block-level daily rainfall maps including Automatic Weather Station (AWS) data.
- MC/RMC specific maps for centre-wise operational review.
- Station coverage statistics panel with tabular and chart views.
- Map and report download capability.

---

**Sub-Modules**

**Daily Actual Rainfall Maps**

Displays observed rainfall for a selected day across India. Available at State, Subdivision, Homogeneous Region, and Country levels, as well as for five regional zones at District level. The map is colour-coded by rainfall amount, helping users instantly identify wet and dry areas across the country.

**Figure 1: iRAINS Rainfall Map – Daily Actual Rainfall View at State Level**

> *[Insert screenshot here]*

**Weekly and Cumulative Departure Maps**

Displays the deviation of observed rainfall from the climatological normal, expressed as a percentage. Available at State, Subdivision, Homogeneous Region, Country, and all five regional zones at District level. Colour coding clearly shows areas of excess, normal, and deficient rainfall.

**Figure 2: iRAINS Rainfall Map – Weekly Departure Map at District Level (Pan India)**

> *[Insert screenshot here]*

**Block-level Rainfall Maps**

Provides the finest spatial resolution by displaying daily actual rainfall at the administrative block level. A separate sub-view uses Automatic Weather Station (AWS) data, allowing comparison between standard station observations and AWS readings.

**Geographic Level and Filter Panel**

Users control which administrative boundary layers are displayed on the map through a filter panel. Options include Country, Region, State or Subdivision, District, and Block. Selecting a mode (State or Subdivision) changes the boundary layer shown over the district rainfall data.

**Figure 3: iRAINS Rainfall Map – Geographic Level and Filter Panel**

> *[Insert screenshot here]*

**MC/RMC Regional Maps**

Displays departure and actual rainfall maps grouped by Meteorological Centre (MC) and Regional Meteorological Centre (RMC) coverage areas. This sub-module supports centre-specific monitoring and operational review by individual forecasting offices.

**Station Coverage Statistics Panel**

A statistics sidebar showing the number of active rainfall stations reporting per district, the number of districts covered per state or subdivision, and a regional coverage summary. Data is presented in sortable tables and a pie chart for quick visual assessment.

**Figure 4: iRAINS Rainfall Map – Station Coverage Statistics Panel**

> *[Insert screenshot here]*

---

**Threshold Computation and Logic**

The Rainfall Map produces three key values for every geographic unit — **Normal Rainfall**, **Actual Rainfall**, and **Departure from Normal**. Each value is calculated through a structured multi-step process grounded in station-level observations and pre-stored climatological reference data.

---

**1. Normal Rainfall**

Normal rainfall is the long-period climatological average for a specific geographic unit and calendar period. These values are pre-calculated from historical records and stored as daily reference values in the iRAINS database at every administrative level. For any selected date range, the Normal Rainfall is the sum of these daily reference values over that period:

> **Normal Rainfall (Period) = Σ Daily Normal Reference Values** (summed over all days in the selected date range)

The source of normal values differs by geographic level:

| Geographic Level | Normal Rainfall Source Table |
|---|---|
| District | `normal_district` table — daily pre-calculated normals per district |
| State | `normal_state` table — daily pre-calculated normals per state |
| Subdivision | `normal_sub_division` table — daily pre-calculated normals per subdivision |
| Region | `normal_region` table — daily pre-calculated normals per homogeneous region |
| Country | `normal_country` table — daily pre-calculated normals for all India |

---

**2. Actual Rainfall**

Actual rainfall is computed through a stepwise aggregation starting from individual weather station observations.

**Step 1 — Station to District (Daily Average):**

For each day, all valid rainfall readings from stations within a district are averaged to produce a single daily district value:

> **District Daily Actual = Average of Valid Station Readings within the District on that Day**

Readings flagged as −999.9 (missing data sentinel) and any negative values are excluded before averaging.

**Step 2 — District Period Total (Accumulation):**

Daily district averages are accumulated across all days in the selected date range:

> **District Actual (Period) = Σ District Daily Actuals** (summed over all days in the selected period)

**Step 3 — State / Subdivision Level (Area-Weighted Average):**

State and subdivision rainfall is computed by weighting each district's period total proportionally by its geographic area. This ensures that larger districts contribute more to the aggregate than smaller ones:

> **State or Subdivision Actual = Σ (District Actual × District Area) ÷ Σ (District Area)**

Only districts that have at least one valid observation contribute to both the numerator and denominator. Districts with no data are excluded from the calculation entirely.

> *Special case for Subdivision calculations:* Two specific districts (with internal codes 30506001 and 30506002) are assigned an area weight of zero and are excluded from subdivision-level weighted averages.

**Step 4 — Region / Country Level (Subdivision-Weighted Average):**

At region level, subdivision rainfall values are further aggregated using pre-assigned subdivision weights:

> **Region Actual = Σ (Subdivision Actual × Subdivision Weight) ÷ Σ (Subdivision Weights)**

Country-level actual rainfall is derived from region-level values through the same weighting process, resulting in a single all-India figure.

---

**3. Departure from Normal**

Once Actual and Normal rainfall are computed at the chosen geographic level, the Departure Percentage is calculated to indicate how much the observed rainfall deviates from the historical average:

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

Special conditions applied in the calculation:

- When Actual Rainfall is **zero**, Departure is set to **−100%** (complete rainfall deficit).
- When no station data is available for a unit, Departure is displayed as **No Data**.
- When Normal Rainfall is zero (rare edge case), a substitute value of **0.01** is used to prevent division errors.

Based on Departure Percentage, each geographic unit is classified into one of six categories:

<a id="table-1"></a>

**Table 1: Rainfall Departure Classification Categories**

| Category | Departure from Normal Rainfall |
|---|---|
| Large Excess | +60% and above |
| Excess | +20% to +59% |
| Normal | −19% to +19% |
| Deficient | −20% to −59% |
| Large Deficient | −60% to −99% |
| No Rainfall | No rain recorded |

These categories are displayed as a colour legend on every map, enabling users to rapidly interpret the spatial pattern of rainfall anomalies across India.

---

**Data Integration**

The Rainfall Map draws information from the following data sources:

- **Observed Rainfall:** Daily station-level rainfall observations collected from meteorological stations across India and stored in the iRAINS database.
- **Climatological Normal Rainfall:** Pre-calculated long-period average rainfall values stored for each geographic level — district, state, subdivision, region, and country.
- **Geographic Boundaries:** Administrative boundary shapefiles for Districts, States, Subdivisions, Blocks, and Homogeneous Regions used to render colour-coded choropleth maps.
- **Station Metadata:** Station location coordinates, administrative assignments, and activation status used for coverage statistics.

---

**Back-End Architecture**

Rainfall data flows through five processing stages before appearing on the map:

1. **Station Data Collection:** Daily rainfall observations are recorded for each meteorological station and stored with date, station code, and district assignment.
2. **District Aggregation:** All station readings within a district are averaged to produce a single daily district-level rainfall value, excluding any invalid or missing data entries (flagged as −999.9).
3. **Higher-Level Aggregation:** District values are aggregated upward using area-weighted averaging. State and subdivision rainfall is computed by weighting each district's rainfall proportionally to its geographic area. Region and country levels apply further weighting based on subdivision weights and region weights respectively.
4. **Normal Rainfall Lookup:** Pre-calculated normal rainfall values for the same geographic unit and date range are retrieved from the database and matched against the observed data.
5. **Departure Calculation and Classification:** The departure percentage is computed, classified into the six departure categories, and rendered as a colour-coded choropleth layer on the interactive map.

---

**Database Connection and Architecture**

The Rainfall Map queries the following core database components:

- **Station Daily Data Table:** Stores daily rainfall readings at station level with collection date, station identifier, and district code.
- **Normal Tables (by level):** Separate pre-computed normal rainfall tables for district, state, subdivision, region, and country levels.
- **Topology and Hierarchy Table:** Links stations, blocks, districts, states, subdivisions, and regions; stores geographic area values and subdivision weights used in the aggregation calculations.

All tables are hosted within the iRAINS PostgreSQL database.

---

**Programming Environment**

The Rainfall Map is delivered as part of the iRAINS Angular web application. Interactive maps are rendered using the **Leaflet** mapping library with custom GeoJSON boundary layers. Coverage statistics charts are rendered using **Highcharts**. The server-side data processing, aggregation, and API services are built using **Node.js** with **Express**, connected to a **PostgreSQL** relational database.

---

**API Generation**

The Rainfall Map section communicates with the iRAINS backend through a set of RESTful HTTP endpoints. Each endpoint accepts query parameters specifying the geographic level, date or date range, and map type, then returns JSON payloads containing aggregated rainfall values and departure classifications for all geographic units at the selected level.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/rainfall/district` | GET | Returns actual, normal, and departure values per district for a given date or date range and regional zone |
| `/api/rainfall/state` | GET | Returns area-weighted state-level actual, normal, and departure values for a selected period |
| `/api/rainfall/subdivision` | GET | Returns area-weighted subdivision-level rainfall and departure values |
| `/api/rainfall/region` | GET | Returns subdivision-weighted region-level rainfall and departure values |
| `/api/rainfall/country` | GET | Returns the national aggregated actual, normal, and departure figures |
| `/api/rainfall/block` | GET | Returns block-level daily actual rainfall values including AWS station data |
| `/api/rainfall/mc-rmc` | GET | Returns centre-wise aggregated rainfall and departure data for MC/RMC operational maps |
| `/api/coverage/stats` | GET | Returns station coverage statistics per district, subdivision, and state for the coverage panel |
| `/api/rainfall/download/map` | POST | Triggers server-side PDF generation for the selected map view and returns a downloadable file |

All endpoints require a valid JWT authentication token. Parameters include `startDate`, `endDate`, `level`, `zone` (for regional district maps), and `mapType` (actual / normal / departure). The backend validates all input, executes the appropriate aggregation query, and returns results in a structured JSON array. Invalid date ranges or unsupported level combinations return HTTP 400 with a descriptive error message. Endpoints used for PDF generation additionally accept layout parameters controlling page size, title text, and legend placement.

---

**User Role and Management**

<a id="table-2"></a>

**Table 2: Rainfall Map – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View Daily Actual Rainfall Maps | ✓ | ✓ | ✓ |
| View Weekly Departure Maps | ✓ | ✓ | ✓ |
| View Cumulative Departure Maps | ✓ | ✓ | ✓ |
| View Block-level Rainfall Maps | ✓ | ✓ | ✓ |
| View MC / RMC Regional Maps | ✓ | ✓ | ✓ |
| Use Geographic Level and Filter Panel | ✓ | ✓ | ✓ |
| View Station Coverage Statistics | ✓ | ✓ | ✓ |
| Download Maps and Reports | ✓ | ✓ | — |

---

**Rainfall Map — Geographic Coverage Reference**

The Rainfall Map section covers India's complete administrative geography across all supported levels. The following reference table summarises the geographic coverage at each level:

| Level | Number of Units | Source Boundary | Normal Data Source |
|---|---|---|---|
| Country | 1 (All India) | India national boundary | `normal_country` |
| Region | 5 homogeneous regions | IMD Homogeneous Region boundaries | `normal_region` |
| Subdivision | 36 meteorological subdivisions | IMD Subdivision boundaries | `normal_sub_division` |
| State | 36 states and UTs | India state boundaries | `normal_state` |
| District (Pan India) | ~700 districts | India district boundaries | `normal_district` |
| District (Regional zones) | ~150–200 per zone | Zone-specific district boundaries | `normal_district` |
| Block | ~6,000+ blocks | India block boundaries | Not available (actual only) |

The five regional district map zones are: Pan India (all districts), Central India, North-West India, East & North-East India, and South Peninsula. These zone-specific maps allow district-level detail to be viewed without the visual complexity of showing all 700 districts simultaneously on a single screen.

---

**Rainfall Map — Departure Category Colour Guide**

The map uses a consistent colour scheme for departure categories across all geographic levels and time periods. This guide summarises the visual language:

| Departure Range | Category | Map Colour | Interpretation |
|---|---|---|---|
| ≥ +60% | Large Excess | Deep Blue | Substantially above normal — strong monsoon activity, potential flood risk |
| +20% to +59% | Excess | Light Blue | Above normal — healthy monsoon activity |
| −19% to +19% | Normal | Green | Within normal range — typical rainfall |
| −20% to −59% | Deficient | Orange / Red | Below normal — weakening monsoon, agricultural impact possible |
| −60% to −99% | Large Deficient | Yellow | Substantially below normal — drought concern, significant water deficit |
| −100% | No Rain | White | No rainfall recorded — complete deficit |
| No data | No Data | Grey | No valid station data available for this unit and period |

When interpreting the map, users should remember that the departure categories are computed from the aggregated district (or higher-level) values, not from individual station readings. A district showing "Normal" may still contain individual stations with heavy rainfall if spatial coverage is low.

---

**Rainfall Map — Download Formats and Use Cases**

The Rainfall Map supports two download options:

**Map Image Download:** Captures the current Leaflet map view as a high-resolution image file. The captured image includes the map polygon layer with departure colours, the colour legend, and any visible labels. Use cases: inclusion in slide presentations, attachment to email briefings, archiving of daily departure maps.

**Report PDF Download:** Generates a formatted PDF document containing the map image alongside a statistical summary table. The PDF follows IMD's standard report layout with the IMD header and footer. Use cases: official operational bulletins, documentation for senior management briefings, submission to state and national disaster management authorities.

---

## ***IRANS Dashboard***

> **Purpose**

The iRAINS Dashboard serves as the central operational interface of the
IMD RAinfall INformation System (iRAINS), providing users with a
real-time, integrated view of rainfall conditions across India. This
section is designed to support efficient rainfall monitoring,
visualization, analysis, and decision-making for users at Headquarters
(HQ), Regional Meteorological Centres (RMCs), Meteorological Centres
(MCs), and Guest access levels.

The primary purpose of the dashboard is to present rainfall information
through an interactive and user-friendly interface that combines
GIS-based maps, statistical summaries, charts, and comparative
analytical tools within a single unified platform. It enables users to
quickly assess rainfall distribution, departures from normal rainfall,
significant rainfall events, and historical rainfall trends across
multiple administrative levels including country, region, subdivision,
state, district, and block.

The dashboard facilitates operational meteorological activities by
allowing users to:

-   Monitor real-time and historical rainfall conditions.

-   Visualize Actual and Departure rainfall patterns using dynamic
    > choropleth maps.

-   Access statistical summaries and rainfall rankings instantly.

-   Perform comparative rainfall analysis between different regions and
    > time periods.

-   Analyze short-term and seasonal rainfall trends using graphical
    > tools.

-   Support forecasting, hydrological assessment, climate monitoring,
    > and disaster management operations.

Additionally, the dashboard improves situational awareness by
integrating automated updates, interactive map controls, customizable
filters, and analytical charts, thereby enabling faster interpretation
of rainfall data and more informed operational decisions. The
hierarchical geographic navigation and comparison capabilities further
enhance the usability of the system for both routine monitoring and
detailed rainfall analysis workflows.

---

**Features**

- Real-time choropleth map showing rainfall conditions across India at the selected administrative level.
- Dynamic geographic layer switching across six levels: Country, Region, Subdivision, State, District, and Block.
- Side-by-side display of interactive map and statistical charts for immediate situational awareness.
- Comparison mode for analysing rainfall across multiple periods or geographic units simultaneously.
- Live top-5 station rainfall feed via a scrolling statistics marquee.
- District and station coverage summary charts presented as pie charts and sortable tables.
- Flexible date controls supporting both single-date and date-range analysis.

---

**Sub-Modules**

**Interactive Choropleth Map**

The central panel of the Dashboard displays a colour-coded rainfall map of India at the selected administrative level. Users switch between **Actual** and **Departure** views and navigate across Country, Region, Subdivision, State, District, and Block levels. Clicking on any geographic unit reveals detailed rainfall figures for that location.

**Figure 5: iRAINS Dashboard – Main Interface Overview**

> *[Insert screenshot here]*

**Figure 6: iRAINS Dashboard – Interactive Choropleth Map at Subdivision Level**

> *[Insert screenshot here]*

**Rainfall Statistics and Charts Panel**

The right-side panel displays statistical summaries corresponding to the active geographic layer. It presents district coverage per state, station counts per region, and subdivision coverage per region in tabular format and as a pie chart. This panel updates automatically when the map layer or date selection changes.

**Figure 7: iRAINS Dashboard – Rainfall Statistics and Charts Panel**

> *[Insert screenshot here]*

**Top 5 Station Rainfall Marquee**

A scrolling ticker at the bottom of the Dashboard continuously displays the five meteorological stations recording the highest rainfall values on the selected date, along with their reported rainfall in millimetres. This provides immediate awareness of significant rainfall events.

**Comparison Mode**

A dedicated comparison view enables users to analyse rainfall conditions across different time periods or regions side by side. This mode supports identification of temporal trends and spatial differences in rainfall performance, aiding operational and climate analysis workflows.

**Figure 8: iRAINS Dashboard – Comparison Mode View**

> *[Insert screenshot here]*

**Navigation and Filter Controls**

The dashboard navigation bar includes:
- **Start Date** and **End Date** pickers for selecting the analysis period.
- **Actual / Departure toggle switch** to switch between observed rainfall and anomaly views.
- **Filter panel** for selecting which administrative boundary layers are overlaid on the map (Country, Region, State or Subdivision, District, Block).
- **Reset Map View** button to return the map to its default extent.

---

**Threshold Computation and Logic**

The Dashboard applies the same three-stage calculation as the Rainfall Map to produce **Normal Rainfall**, **Actual Rainfall**, and **Departure from Normal** for each geographic unit displayed.

**Normal Rainfall** is retrieved from pre-stored daily climatological reference values in the database, summed over the selected date range at the chosen geographic level (district, state, subdivision, region, or country).

**Actual Rainfall** is computed from station observations through the following steps:

> **Step 1:** Station readings within each district are averaged per day (excluding missing and invalid values).
> **Step 2:** Daily district averages are summed across the selected period to give a district total.
> **Step 3:** District totals are aggregated to state and subdivision level using area-weighted averaging:
> **State / Subdivision Actual = Σ (District Actual × District Area) ÷ Σ (District Area)**
> **Step 4:** Region and country values are derived using subdivision-weighted averaging.

**Departure from Normal** is then calculated as:

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

Special conditions:

- When Actual Rainfall is **zero**, Departure is set to **−100%** (complete deficit).
- When data is unavailable for a unit, it is displayed as **No Data**.
- The Dashboard default view is set to **Subdivision** level on load.

<a id="table-3"></a>

**Table 3: iRAINS Dashboard – Rainfall Departure Classification**

| Category | Departure from Normal Rainfall |
|---|---|
| Large Excess | +60% and above |
| Excess | +20% to +59% |
| Normal | −19% to +19% |
| Deficient | −20% to −59% |
| Large Deficient | −60% to −99% |
| No Rainfall | No rain recorded |

---

**Data Integration**

The Dashboard integrates data from the following sources:

- **Observed Rainfall:** Station-level daily observations aggregated to the selected geographic level (district, state, subdivision, region, or country).
- **Climatological Normal Rainfall:** Long-period average values for computing departure at each administrative level.
- **Station Coverage Data:** Number of active stations per district and per region, used to populate the coverage charts and tables.
- **Geographic Hierarchy Data:** Administrative boundary and parent-child hierarchy information for all six levels, enabling seamless geographic navigation.

---

**Back-End Architecture**

The Dashboard uses the same multi-level rainfall aggregation pipeline as the Rainfall Map. The processing flow is as follows:

1. Station daily observations are retrieved for the selected date or date range.
2. Observations are aggregated progressively from station to district, then to state or subdivision (area-weighted), then to region and country (subdivision-weighted).
3. Departure percentages are computed and classified into the six standard categories.
4. Coverage statistics — station counts per district and per region — are retrieved from station metadata.
5. The top-5 station rankings are generated by sorting station-level readings in descending order of rainfall.
6. All results are delivered via REST API endpoints and rendered across the map, charts panel, and marquee components.

---

**Database Connection and Architecture**

The Dashboard queries the same core database tables used across the iRAINS platform:

- **Station Daily Data Table** for observed rainfall at station level.
- **Normal Tables** (district, state, subdivision, region, country) for climatological comparison.
- **Topology and Hierarchy Table** for geographic area weights and administrative linkages.
- **Station Details Table** for station metadata including centre assignments and geographic coordinates.

All tables reside in the iRAINS PostgreSQL database.

---

**Programming Environment**

The iRAINS Dashboard is built as an Angular application. The interactive map uses **Leaflet** with custom GeoJSON layers for administrative boundaries. Statistical charts are rendered with **Highcharts**. The scrolling station marquee is a custom Angular component. Server-side APIs are built with **Node.js** and **Express**, connected to **PostgreSQL**.

---

**API Generation**

The Dashboard section relies on a combination of aggregation and statistics endpoints to populate all views simultaneously on page load. The map layer, the statistics panel, and the comparison views each call dedicated endpoints, allowing independent component refresh without reloading the entire page.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/dashboard/map` | GET | Returns choropleth map data (actual, normal, departure) for the selected geographic level and date |
| `/api/dashboard/stats` | GET | Returns the rainfall summary statistics panel — national, regional, and subdivision summaries |
| `/api/dashboard/top-stations` | GET | Returns the top five rainfall stations for the marquee ticker and rankings panels |
| `/api/dashboard/comparison` | GET | Returns side-by-side rainfall data for the comparison mode, accepting two separate date parameters |
| `/api/dashboard/departure-chart` | GET | Returns the time-series departure chart data for the selected region and period |
| `/api/dashboard/download` | POST | Generates and returns a formatted PDF export of the current dashboard state including map and statistics |

Dashboard API endpoints accept parameters including `date`, `level` (subdivision / state / district), `region`, and `mapType`. The comparison mode endpoint additionally accepts `compareDate` alongside the primary `date`. All endpoints return structured JSON with numeric rainfall values, departure percentages, and pre-classified category codes. The frontend applies colour mapping to category codes client-side, reducing server processing load for display rendering.

---

**User Role and Management**

<a id="table-4"></a>

**Table 4: iRAINS Dashboard – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View Interactive Choropleth Map | ✓ | ✓ | ✓ |
| View Rainfall Statistics and Charts Panel | ✓ | ✓ | ✓ |
| View Top 5 Station Rainfall Marquee | ✓ | ✓ | ✓ |
| Use Comparison Mode | ✓ | ✓ | ✓ |
| Use Date and Filter Controls | ✓ | ✓ | ✓ |
| Switch Geographic Levels | ✓ | ✓ | ✓ |
| Download Maps and Reports | ✓ | ✓ | — |

---

**iRAINS Dashboard — Panel Summary Reference**

The Dashboard interface is divided into several distinct visual panels, each serving a specific analytical purpose. The following reference table describes each panel, its location, and its primary function:

| Panel | Location | Content | Primary Use |
|---|---|---|---|
| Top Banner | Top of page | Current date, national actual rainfall (mm), national departure (%), marquee of top 5 stations | Instant national headline for the day |
| Choropleth Map | Left/centre | Interactive Leaflet map at the selected geographic level (Subdivision default), colour-coded by departure | Spatial overview of rainfall distribution |
| Polygon Click Popup | On map | Unit name, actual (mm), normal (mm), departure (%), category | Detailed values for a specific polygon |
| Statistics Panel — Departure Chart | Right, tab 1 | Horizontal bar chart — one bar per homogeneous region, showing departure from normal | Regional comparison of rainfall anomalies |
| Statistics Panel — Category Distribution | Right, tab 2 | Table or donut chart: count of units in each departure category | National overview of how many units are normal / deficient / excess |
| Statistics Panel — Rankings | Right, tab 3 | Top 10 wettest and driest units for the selected date and level | Identify extremes for operational briefings |
| Comparison Panel | Bottom (toggleable) | Side-by-side departure maps for two user-selected dates | Before/after comparison, year-to-year comparison |

---

**iRAINS Dashboard — Recommended Daily Use Sequence**

Operational meteorologists typically use the Dashboard in the following sequence each morning as part of the standard monitoring routine:

1. **Check the top banner** first thing on login. The national departure figure (e.g., "+12% above normal") and the marquee of top 5 stations provide an immediate situational summary before any deeper analysis.

2. **Read the choropleth map** at Subdivision level (the default). A colour-coded national overview takes less than 30 seconds to interpret and gives the spatial pattern of the day.

3. **Click through the Statistics Panel tabs:** Review the Category Distribution tab to count how many subdivisions are in each departure category. If 20+ subdivisions are in Deficient or Large Deficient, this is significant enough to note in the morning briefing.

4. **Enable Comparison Mode** if today's pattern looks unusual or significantly different from recent days. Select yesterday or the same date from last year as the comparison date.

5. **Switch from Subdivision to District level** if a specific region shows an anomaly at Subdivision level. The District-level map shows the intra-subdivision spatial structure.

6. **Note the top 5 stations** in the marquee. If any station exceeds 115 mm (very heavy rainfall), navigate to the Significant Rainfall section for a full listing of all heavy-rain stations.

**Dashboard — Geographic Level Comparison Guide**

The Dashboard supports five geographic levels, each providing a different granularity of analysis. Switching between levels uses the same underlying data but aggregates it differently for the map and statistics panel:

| Level | Number of Units | Typical Use Case | Data Update Frequency |
|---|---|---|---|
| **Subdivision** | 36 units | Default operational overview; subdivision is the standard IMD bulletin unit | Updated every 30 minutes after 11:30 IST |
| **District** | 700+ units | Intra-subdivision spatial analysis; identifying the precise geographic extent of anomalies | Updated every 30 minutes after 11:30 IST |
| **State** | 36 states/UTs | State-level reporting; state disaster management coordination | Updated every 30 minutes after 11:30 IST |
| **Region** | 5 regions | National-scale summary; inter-regional comparison | Updated every 30 minutes after 11:30 IST |
| **Country** | 1 (all India) | Single national summary figure | Updated every 30 minutes after 11:30 IST |

**Dashboard — Interpreting the Comparison Mode**

The Comparison Mode in the Dashboard allows two dates to be viewed side-by-side:

- **Same-year comparison (yesterday vs. today):** Shows how the rainfall pattern has shifted in 24 hours. Useful for detecting the advancement or retreat of a monsoon system.
- **Year-to-year comparison (this year vs. last year):** Shows whether the current season is tracking ahead or behind the previous year at the same point in the season. Useful for briefings to stakeholders asking for a year-on-year comparison.
- **Event comparison (before/after a weather system):** Compare the map from the day before a depression made landfall against the day of landfall to show the rainfall enhancement caused by the system.

**Dashboard — Data Latency Warning**

Because the Dashboard reflects aggregated data that updates on the 30-minute refresh cycle, users accessing the Dashboard before 11:30 IST will see the previous day's data as the most recent observation. A timestamp shown in the top banner indicates the data-as-of time, allowing users to confirm that they are viewing current-day or prior-day data. During the monsoon season, this distinction is important for morning briefing materials, which should always note the data date clearly.

---

## ***Rainfall Graphs***

> **Purpose**

The Rainfall Graphs section of iRAINS is designed to provide graphical
visualization and comparative analysis of rainfall data across different
seasons, regions, and years. This section enables users to analyze
rainfall trends and variability through interactive graphical
representations of Actual, Normal, and Departure rainfall values.

The primary purpose of this module is to support meteorological
analysis, seasonal rainfall assessment, and climate trend evaluation by
presenting rainfall information in an easily interpretable graphical
format. The module allows users to compare rainfall performance across
multiple homogeneous regions of India, including Pan India, Central
India, North-West India, East & North-East India, and South Peninsula.

Users can analyze rainfall conditions for different meteorological
seasons such as Winter, Pre-Monsoon, Monsoon, and Post-Monsoon by
selecting the desired year and visualization mode. The availability of
both Cumulative and Non-Cumulative views helps users examine rainfall
progression over time as well as overall seasonal accumulation patterns.

The Rainfall Graphs section supports operational and analytical
workflows by enabling users to:

-   Visualize Actual, Normal, and Departure rainfall trends graphically.

-   Compare seasonal rainfall performance across regions and years.

-   Analyze cumulative and day-to-day rainfall behavior.

-   Identify rainfall anomalies, excess, and deficient periods.

-   Support climatological studies, forecasting analysis, and
    > operational reporting.

By integrating interactive graph-based visualization with customizable
seasonal and regional filters, this section provides an effective
analytical tool for understanding rainfall variability, monitoring
seasonal progression, and supporting data-driven meteorological
decision-making within IMD operations.

---

**Features**

- Seasonal rainfall graphs for four meteorological seasons: Winter, Pre-Monsoon, Monsoon, and Post-Monsoon.
- Five homogeneous region options: Pan India, Central India, North-West India, East and North-East India, and South Peninsula.
- Year selection spanning historical records for multi-year comparison.
- Two visualization modes: Non-Cumulative (daily rainfall) and Cumulative (running season total).
- Three data series plotted simultaneously: Actual Rainfall, Normal Rainfall, and Departure from Normal.
- Combined column-and-line chart for intuitive comparison of observed versus expected rainfall.
- Chart export options: fullscreen view and print.

---

**Sub-Modules**

**Season Selector**

Users select one of four meteorological seasons to define the analysis period. Each season maps to a fixed calendar date range as shown below:

| Season | Date Range |
|---|---|
| Winter | 1 January – 28/29 February |
| Pre-Monsoon | 1 March – 31 May |
| Monsoon | 1 June – 30 September |
| Post-Monsoon | 1 October – 31 December |

**Region Selector**

Users select one of five homogeneous climatic zones of India for which the graph is generated:

- **Pan India** — all-India aggregate
- **Central India** — central plains and Deccan plateau region
- **North-West India** — Rajasthan, Punjab, Haryana, and adjoining areas
- **East and North-East India** — West Bengal, Odisha, and North-Eastern states
- **South Peninsula** — peninsular India south of approximately 15°N

**Year Selector**

Users choose the analysis year. Historical data is available from 1700 onwards. This enables multi-year comparison by repeatedly selecting different years.

**Non-Cumulative View (Daily Rainfall)**

Displays day-by-day rainfall for the selected season, region, and year. Each bar represents the actual rainfall recorded on that specific day, overlaid with the daily climatological normal as a line. This view helps identify individual wet days, dry spells, and short-period anomalies within a season.

**Figure 9: iRAINS Rainfall Graphs – Seasonal Graph View (Non-Cumulative)**

> *[Insert screenshot here]*

**Cumulative View (Running Season Total)**

Displays the progressive accumulation of rainfall from the start of the selected season up to each date. Both actual and normal cumulative values are plotted, allowing users to assess whether the season is tracking above or below the expected climatological progression at any point in time. The gap between the actual and normal cumulative lines indicates the overall seasonal surplus or deficit at each stage.

---

**Threshold Computation and Logic**

The Rainfall Graphs section produces three computed values — **Normal Rainfall**, **Actual Rainfall**, and **Departure from Normal** — at the regional level. The computation follows the same station-to-region aggregation pipeline used across all iRAINS modules.

---

**Normal Rainfall (Region)**

Normal rainfall values are pre-stored in the database as daily reference figures for each homogeneous region. For the selected date range, the normal is derived as follows:

- **Non-Cumulative:** Each day's normal = the pre-stored daily reference value for that region and calendar date.
- **Cumulative:** Running total from season start = `Σ (daily normal values from season start to current date)`.

---

**Actual Rainfall (Region)**

Actual region rainfall is computed through a three-level aggregation from station observations:

**Step 1 — Station to District (Daily Average):**

> **District Daily Actual = Average of Valid Station Readings within the District on that Day**

Readings marked as −999.9 and negative values are excluded.

**Step 2 — District to Subdivision (Area-Weighted Average):**

> **Subdivision Actual = Σ (District Actual × District Area) ÷ Σ (District Area)**

**Step 3 — Subdivision to Region (Subdivision-Weighted Average):**

> **Region Actual = Σ (Subdivision Actual × Subdivision Weight) ÷ Σ (Subdivision Weights)**

Subdivision weights are pre-assigned in the topology table based on the relative climatological significance of each subdivision within its region.

- **Non-Cumulative:** Each point on the chart = the region daily actual for that specific date.
- **Cumulative:** Each point = `Σ (Region Daily Actuals from season start to current date)`.

---

**Departure from Normal**

Departure measures how far the actual rainfall has deviated from the climatological normal:

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

- In the Non-Cumulative chart, departure values are computed and plotted on a weekly basis (Wednesdays), giving a smoothed picture of within-season anomalies.
- In the Cumulative chart, departure reflects the overall seasonal surplus or deficit up to the selected date.
- When Normal Rainfall is zero, a substitute value of 0.01 is used to prevent division errors.

---

**Data Integration**

The Rainfall Graphs module uses the following data sources:

- **Station Daily Data:** Daily rainfall observations from meteorological stations, used as the raw input for district-level averaging.
- **Normal Region Table:** Pre-calculated daily climatological normal values for each homogeneous region, used to plot the normal series and compute departure.
- **Topology and Hierarchy Table:** Links districts to subdivisions and regions; stores district area values and subdivision weights required for the aggregation formulas.
- **Calculation Exclusions Table:** Ensures that stations, blocks, or districts flagged for exclusion are removed before aggregation.

---

**Back-End Architecture**

The data processing flow for the Rainfall Graphs section is as follows:

1. The user selects a season, region, and year on the frontend; the system determines the corresponding calendar start and end dates automatically.
2. A request is sent to the backend with the date range.
3. The backend queries station daily data, joins with district and region hierarchy tables, and applies the three-level aggregation (station → district → subdivision → region).
4. For cumulative mode, a running sum window function is applied over the region's daily values ordered by date.
5. Normal values are retrieved from the pre-stored region normal table and similarly accumulated for cumulative mode.
6. Departure is computed at weekly intervals for non-cumulative mode, or from cumulative values for cumulative mode.
7. The resulting time series — actual, normal, and departure — are returned to the frontend and rendered as a Highcharts column-and-line chart.

---

**Database Connection and Architecture**

The Rainfall Graphs section queries the following core database tables:

- **Station Daily Data Table:** Daily station-level observations with collection date, station code, and district code.
- **Normal Region Table:** Pre-stored daily normal rainfall values for each homogeneous region.
- **Normal District Details Table:** Geographic hierarchy, district area values, and subdivision weights used for aggregation.
- **Calculation Exclusions Table:** List of excluded entities (station, block, district) for data quality control.

All tables are hosted in the iRAINS PostgreSQL database.

---

**Programming Environment**

The Rainfall Graphs section is built using **Angular** for the frontend. Charts are rendered using **Highcharts** as combined column-and-line series. Season date ranges are managed by a shared constants service within the application. The backend API is built with **Node.js** and **Express**, with multi-level aggregation queries executed against a **PostgreSQL** database.

---

**API Generation**

The Rainfall Graphs section uses a single primary endpoint that returns all data needed to render the column-and-line chart for the selected season, region, and year. The endpoint computes both the daily actual rainfall series and the corresponding daily normal series at the selected regional level, with cumulative running totals computed on the frontend.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/graphs/seasonal` | GET | Returns the full daily actual and normal rainfall series for the selected region, season, and year |
| `/api/graphs/regions` | GET | Returns the list of available homogeneous regions and their valid date ranges |
| `/api/graphs/download` | POST | Generates and returns a high-resolution image or PDF export of the current chart |

The primary endpoint accepts parameters `season` (monsoon / pre-monsoon / winter / post-monsoon), `region` (pan-india / central-india / nw-india / east-ne-india / south-peninsula), and `year`. The backend retrieves pre-aggregated daily region-level rainfall values from the normal and actual data tables for the specified season date window, returning an ordered array of `{ date, actual, normal }` objects. The frontend processes this array to build the Highcharts series configuration, applying the cumulative toggle by computing running sums over the date-ordered array before rendering.

---

**User Role and Management**

<a id="table-5"></a>

**Table 5: Rainfall Graphs – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| Select Season, Region, and Year | ✓ | ✓ | ✓ |
| View Non-Cumulative Daily Graph | ✓ | ✓ | ✓ |
| View Cumulative Seasonal Graph | ✓ | ✓ | ✓ |
| View Departure Series | ✓ | ✓ | ✓ |
| Export Chart (Fullscreen / Print) | ✓ | ✓ | ✓ |

---

**Rainfall Graphs — Season and Region Quick Reference**

| Season | Date Range | Dominant Rainfall System | Regions Most Relevant |
|---|---|---|---|
| Winter | Jan 1 – Feb 28/29 | Western disturbances, fog events | North-West India |
| Pre-Monsoon | Mar 1 – May 31 | Thunderstorms, pre-monsoon showers, Nor'westers | East & North-East India, South Peninsula |
| Southwest Monsoon | Jun 1 – Sep 30 | Arabian Sea and Bay of Bengal branches of SW monsoon | All regions; especially Central and South Peninsula |
| Post-Monsoon / NE Monsoon | Oct 1 – Dec 31 | Northeast monsoon, cyclones in Bay of Bengal | South Peninsula (Tamil Nadu, Coastal AP) |

For each season, the corresponding region(s) show the highest seasonal totals and the most meaningful year-to-day variability in the Rainfall Graphs charts.

**Cumulative vs. Non-Cumulative Graph Modes**

The Rainfall Graphs section supports two graphing modes that serve complementary analytical purposes:

- **Non-Cumulative (Daily) Mode:** Each data point represents the rainfall for that specific day. The y-axis shows the day's actual rainfall against the day's normal. This mode is best for identifying peak rainfall days, comparing day-to-day variability, and identifying dry or wet spells within a season.
- **Cumulative Mode:** Each data point is the running total from the start of the season to that date. The y-axis shows the accumulated actual rainfall against the accumulated normal. This mode is best for tracking the overall seasonal progress — whether the season is running ahead of or behind normal at any point in time.

**Year-Comparison Analysis**

The year selector in the Rainfall Graphs section allows users to compare any past year against any other year for the same season and region. This capability supports:

- **El Niño / La Niña comparisons:** Select known El Niño years (e.g., 2002, 2009, 2015) alongside La Niña years (e.g., 2007, 2010, 2020) to visualise the contrast in seasonal rainfall progress.
- **Benchmark comparison:** For a current season, compare against the previous year and against a particularly good or bad historical year to calibrate expectations.
- **Policy briefings:** Long-term trend analysis by comparing rainfall in early decades (1980s, 1990s) against recent decades to illustrate changes in seasonal patterns.

**Region Reference — All-India Seasonal Normal Values (Approximate)**

| Region | SW Monsoon Normal (Jun–Sep, mm) | Annual Normal (mm) |
|---|---|---|
| South Peninsula | ~550–750 | ~900–1,100 |
| East & Northeast India | ~1,200–1,800 | ~1,500–2,200 |
| Central India | ~700–900 | ~900–1,100 |
| Northwest India | ~200–350 | ~350–500 |
| All India (Pan India) | ~880 (LPA) | ~1,200 |

Note: Normal values are approximate region-wide averages. Individual subdivisions within each region have significantly different normals (e.g., Meghalaya within East & NE India receives >10,000 mm annually, while West Rajasthan in NW India may receive < 150 mm annually).

---

**Rainfall Graphs — Interpreting the Non-Cumulative vs. Cumulative View**

**Non-Cumulative (Daily) View:**
- Shows raw daily actual and normal rainfall for each day in the season.
- Best for identifying individual heavy-rain events (tall bars) and dry spells (near-zero bars).
- Active monsoon phases appear as clusters of tall bars; break monsoon phases appear as flat near-zero stretches between active pulses.

**Cumulative View:**
- Shows the running sum of actual and normal rainfall from the first day of the season to each date.
- The gap between the cumulative actual and cumulative normal curves at any point reveals the season's overall deficit or surplus up to that date.
- A converging gap indicates that a recent active spell has begun recovering a prior deficit.
- A diverging gap indicates an ongoing trend of worsening deficit (cumulative actual falling below normal) or worsening surplus (actual exceeding normal).
- This is the most commonly used view for official monsoon performance assessments and is the primary chart format used in IMD's media briefings.

---

## ***NWP Rainfall Products***

> **Purpose**

The NWP Rainfall Products section of iRAINS is designed to provide
operational access to Numerical Weather Prediction (NWP)-based rainfall
forecast products generated from multiple national and regional weather
forecasting models. This section enables users to visualize and analyze
forecasted rainfall scenarios across major meteorological centres and
river basin regions of India for short-range and medium-range
forecasting applications.

The primary purpose of this module is to support forecasting operations,
hydrological assessment, flood preparedness, reservoir management, and
disaster risk reduction activities by integrating outputs from multiple
advanced weather prediction systems into a single unified platform.
Unlike observed rainfall products, this section focuses on
model-generated rainfall forecasts, allowing users to assess anticipated
rainfall conditions up to seven days in advance depending on the
selected model.

The module provides access to deterministic and probabilistic rainfall
forecast products generated from various operational forecasting systems
including:

-   WRF ARW

-   IMD GFS

-   IMD GFS with Bias Correction (BC)

-   NCUM

-   NCUM-R (00 UTC and 12 UTC)

-   GEFS

-   NEPS

These models differ in spatial resolution, forecast range, forecasting
methodology, and uncertainty representation, enabling users to compare
outputs from multiple forecast systems to improve operational confidence
and decision-making.

The NWP Rainfall Products section supports users by enabling them to:

-   Monitor forecasted rainfall patterns over major meteorological
    > centres and river basins.

-   Access short-range and medium-range rainfall forecasts from multiple
    > operational NWP models.

-   Analyze both deterministic rainfall forecasts and probabilistic
    > rainfall forecasts (PQPF).

-   Assess forecast uncertainty and rainfall exceedance probabilities
    > using ensemble prediction systems.

-   Compare forecast outputs across different models for improved
    > situational awareness.

-   Support flood forecasting, reservoir inflow assessment, dam
    > operation planning, and disaster preparedness activities.

-   Enhance operational meteorological analysis through multi-model
    > forecast guidance.

The inclusion of Probabilistic Quantitative Precipitation Forecast
(PQPF) products from ensemble systems such as GEFS and NEPS further
strengthens the capability of the platform by providing risk-based
rainfall guidance rather than single deterministic outputs. This is
particularly valuable for impact-based forecasting and decision support
during heavy rainfall, monsoon activity, cyclones, and flood-prone
situations.

Overall, the NWP Rainfall Products section serves as a centralized
forecast visualization and analysis platform that enhances IMD's
operational forecasting capabilities by integrating multiple advanced
NWP systems into an accessible and user-friendly interface.

---

**Features**

- Access to rainfall forecast maps from eight operational NWP models.
- Short-range forecasts available up to seven days ahead (D+1 through D+7) depending on the selected model.
- Two geographic views: Meteorological Centre coverage areas and River Basin regions.
- Deterministic forecast maps showing expected rainfall amounts by district or basin.
- Probabilistic Quantitative Precipitation Forecast (PQPF) products from ensemble systems for risk-based assessment.
- Multi-model comparison capability for improved forecast confidence.
- Map download capability for operational reporting and dissemination.

---

**Sub-Modules**

**Model Selector**

Users choose from eight operational NWP forecast systems. Each model has a different spatial resolution, forecast range, and methodology:

<a id="table-6"></a>

**Table 6: NWP Model Products Available in iRAINS**

| Model | Full Name | Type | Forecast Range |
|---|---|---|---|
| WRF ARW | Weather Research and Forecasting – Advanced Research WRF | Deterministic | Short-range (up to D+3) |
| IMD GFS | IMD Global Forecast System | Deterministic | Short to medium-range (up to D+5) |
| IMD GFS-BC | IMD GFS with Bias Correction | Deterministic (corrected) | Short to medium-range (up to D+5) |
| NCUM | National Unified Model | Deterministic | Short to medium-range (up to D+5) |
| NCUM-R (00 UTC) | NCUM Regional, 00 UTC initialisation | Deterministic | Short-range (up to D+3) |
| NCUM-R (12 UTC) | NCUM Regional, 12 UTC initialisation | Deterministic | Short-range (up to D+3) |
| GEFS | Global Ensemble Forecast System | Probabilistic (ensemble) | Medium-range (up to D+7) |
| NEPS | National Ensemble Prediction System | Probabilistic (ensemble) | Medium-range (up to D+7) |

**Day Selector**

Users select the forecast lead time, ranging from Day 1 (D+1, next day) to Day 7 (D+7, seven days ahead). The available range depends on the selected model — ensemble models (GEFS, NEPS) provide guidance up to D+7, while limited-area models (WRF ARW, NCUM-R) are available for shorter lead times.

**Geographic View — Meteorological Centres**

Displays forecast rainfall maps organised by the coverage areas of IMD's Meteorological Centres across India. This view is used for operational monitoring by forecasters at individual centres.

**Figure 10: iRAINS NWP Rainfall Products – Model Forecast Map**

> *[Insert screenshot here]*

**Geographic View — River Basins**

Displays forecast rainfall maps for major river basins of India. This view supports hydrological applications including flood forecasting, reservoir inflow assessment, and dam operation planning, where basin-scale rainfall forecasts are more operationally relevant than administrative boundaries.

**Probabilistic Quantitative Precipitation Forecast (PQPF)**

Available from ensemble models (GEFS and NEPS), PQPF maps show the probability of rainfall exceeding defined thresholds at each location. Rather than a single forecast value, PQPF provides a risk-based assessment — for example, the probability that rainfall will exceed 64.5 mm (heavy rain threshold) or 115.6 mm (very heavy rain threshold) on a given day. This supports impact-based forecasting and early warning decisions.

**Figure 11: iRAINS NWP Rainfall Products – Probabilistic QPF (PQPF) View**

> *[Insert screenshot here]*

---

**Threshold Computation and Logic**

The NWP Rainfall Products section does not compute values from observed station data. All forecast values are generated by the respective NWP modelling systems operated by IMD and displayed as pre-produced map products within iRAINS. The PQPF products from ensemble systems use the following standard IMD rainfall intensity thresholds:

| Threshold | Rainfall Amount | Classification |
|---|---|---|
| Light Rain | 2.5 – 15.5 mm / day | Low intensity |
| Moderate Rain | 15.6 – 64.4 mm / day | Moderate intensity |
| Heavy Rain | 64.5 – 115.5 mm / day | High intensity |
| Very Heavy Rain | 115.6 – 204.4 mm / day | Very high intensity |
| Extremely Heavy Rain | ≥ 204.5 mm / day | Extreme intensity |

PQPF maps show the probability (as a percentage) that rainfall at any location will exceed these thresholds on the selected forecast day.

---

**Data Integration**

The NWP Rainfall Products section integrates forecast output from multiple external modelling systems:

- **WRF ARW:** Limited-area mesoscale model output, providing high-resolution rainfall forecasts for India.
- **IMD GFS and IMD GFS-BC:** Global model outputs from IMD's operational Global Forecast System. The bias-corrected (BC) variant applies post-processing corrections to reduce systematic model errors.
- **NCUM and NCUM-R:** Outputs from the National Unified Model, operated jointly by IMD and NCMRWF. NCUM-R provides regional-scale higher-resolution forecasts with two daily initialisation runs (00 UTC and 12 UTC).
- **GEFS and NEPS:** Ensemble forecast outputs providing probabilistic rainfall guidance. GEFS is driven by NCEP/NOAA global ensemble data; NEPS is the IMD national ensemble system.

All forecast products are generated externally by IMD's operational forecasting infrastructure and delivered to iRAINS as map image products for display and dissemination.

---

**Back-End Architecture**

The NWP Rainfall Products section operates differently from the observed-data modules. Forecast map images are produced by IMD's operational NWP modelling systems and stored on the iRAINS server as pre-rendered graphical products. When a user selects a model, geographic view, and forecast day, the system retrieves and displays the corresponding pre-generated map image without performing any real-time numerical computation. PQPF products are similarly stored as pre-rendered probability map images from ensemble model runs.

---

**Database Connection and Architecture**

NWP forecast products are stored as map image files on the iRAINS server, organised by model name, geographic view, initialisation date, and forecast lead time. No observed station data tables are queried for this section. Metadata about available forecast products (model names, available dates, forecast ranges) is maintained in the server file directory structure.

---

**Programming Environment**

The NWP Rainfall Products interface is built using **Angular**. Forecast map images are retrieved from the iRAINS server file system and displayed within the web interface. Model and day selectors are implemented as Angular dropdown components. The **Leaflet** mapping library may be used to overlay forecast images on base maps where applicable.

---

**API Generation**

The NWP Rainfall Products section primarily serves static forecast image assets rather than database-driven JSON payloads. The backend endpoints resolve server file paths based on model identifier, forecast date, view type (MC or River Basin), and lead time, then return pre-generated image files. This design avoids redundant reprocessing of NWP output, which is ingested from external model runs and stored as ready-to-serve raster images.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/nwp/models` | GET | Returns the list of available NWP models with their supported date ranges and lead times |
| `/api/nwp/forecast-image` | GET | Returns the forecast map image for the specified model, date, lead-time day, and view type (MC / River Basin) |
| `/api/nwp/pqpf` | GET | Returns the probabilistic QPF ensemble product image for the specified model (GEFS / NEPS), date, and threshold |
| `/api/nwp/available-dates` | GET | Returns the list of initialisation dates for which forecast products are available for a given model |
| `/api/nwp/download` | GET | Returns the selected forecast image as a downloadable file attachment |

The `forecast-image` endpoint accepts `model`, `initDate`, `leadDay`, and `viewType` as query parameters. File paths are constructed server-side from a configured root directory using a standardised naming convention matching the NWP ingestion pipeline. If the requested file is not found — due to a missing forecast run or ingestion delay — the endpoint returns HTTP 404 with a message indicating that the product is not yet available. PQPF endpoints additionally accept a `threshold` parameter (expressed as a probability percentage) to select the appropriate probability exceedance layer.

---

**User Role and Management**

<a id="table-7"></a>

**Table 7: NWP Rainfall Products – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| Select NWP Model | ✓ | ✓ | ✓ |
| Select Forecast Day (D+1 to D+7) | ✓ | ✓ | ✓ |
| View Meteorological Centre Maps | ✓ | ✓ | ✓ |
| View River Basin Maps | ✓ | ✓ | ✓ |
| View PQPF Probabilistic Maps | ✓ | ✓ | ✓ |
| Download Forecast Maps | ✓ | ✓ | — |

---

**NWP Rainfall Products — Model Availability and Timing Reference**

NWP forecast products in iRAINS are generated from operational model runs. The following table provides the expected availability times for each model's products on the iRAINS server, based on typical IMD NWP production timelines:

| Model | Run Initialization | Expected Availability on iRAINS | Forecast Lead Times Available |
|---|---|---|---|
| WRF ARW | 00Z daily | ~08:00–10:00 IST | D+1 to D+3 |
| IMD GFS | 00Z daily | ~09:00–11:00 IST | D+1 to D+7 |
| IMD GFS-BC | 00Z daily | ~10:00–12:00 IST (after bias correction) | D+1 to D+7 |
| NCUM | 00Z daily | ~10:00–12:00 IST | D+1 to D+7 |
| NCUM-R 00Z | 00Z daily | ~11:00–13:00 IST | D+1 to D+3 |
| NCUM-R 12Z | 12Z daily | ~20:00–22:00 IST | D+1 to D+3 |
| GEFS | 00Z daily | ~12:00–14:00 IST | D+1 to D+7 (PQPF) |
| NEPS | 00Z daily | ~13:00–15:00 IST | D+1 to D+7 (PQPF) |

Note: These are approximate availability windows. Actual availability depends on the NWP production server's processing load and the ingestion pipeline's transfer time. Users who do not see an expected product should check back after the expected availability window before reporting an issue to the system administrator.

---

**NWP Rainfall Products — Guidance on Model Selection for Forecasting**

The choice of which model to reference depends on the forecast purpose and lead time:

| Forecast Purpose | Recommended Model(s) | Rationale |
|---|---|---|
| Next 24-hour heavy rainfall advisory | WRF ARW, NCUM-R (00Z or 12Z) | Fine-resolution; best captures mesoscale features and orographic effects |
| Next 48–72 hour district advisory | IMD GFS-BC, NCUM, WRF ARW | Bias-corrected or good performance at medium-range |
| Extended range (Day+4 to Day+7) | GEFS PQPF, NEPS PQPF | Deterministic skill degrades; ensemble probability more reliable |
| Cyclone track and rain forecast | IMD GFS, NCUM | Proven performance in Bay of Bengal and Arabian Sea cyclone scenarios |
| Flood river basin catchment | River Basin view of all available models | Multi-model consensus for catchment QPF |
| Monsoon onset/withdrawal | GEFS PQPF, IMD GFS ensemble | Extended-range probabilistic signal |

**NWP Products — Recommended Daily Usage Sequence**

During the active monsoon season, the following sequence is recommended for using the NWP Rainfall Products section as part of the daily operational briefing cycle:

1. **Open NCUM-R 00Z (D+1)** — This is the highest-resolution model for the next 24 hours. Identify districts with forecast heavy rainfall (≥64.5 mm) and cross-check with the NCUM-R 12Z product from the previous evening for consistency.
2. **Open IMD GFS-BC (D+1 to D+3)** — Compare the D+1 forecast from GFS-BC against NCUM-R. If both agree on the location and magnitude of heavy rainfall, confidence in the forecast is high.
3. **Open GEFS PQPF (D+4 to D+7)** — For extended range, review the probability of >50 mm rainfall over the critical regions. If probability exceeds 60–70%, flag for the extended range bulletin.
4. **Switch to River Basin view for FMO guidance** — For any river basin where heavy rainfall is indicated in D+1 to D+3, switch to the River Basin view of NCUM-R or IMD GFS-BC to assess the catchment-scale QPF for dam operations and flood early warning.
5. **Compare against observed departure (Monsoon Activity)** — Navigate to the Monsoon Activity section and compare the current monsoon state with the NWP forecast. If the observed state is already Active/Vigorous and D+1 models continue to show high rainfall, escalate the confidence level in the forecast.

---

## ***Rainfall Statistics*** 

> **Purpose**

The Rainfall Statistics section of iRAINS is designed to provide
comprehensive statistical analysis and tabular representation of
rainfall data across multiple administrative and meteorological levels.
This module enables users to systematically analyze rainfall
distribution patterns, rainfall departures, and category-wise rainfall
classification for operational monitoring, reporting, and climatological
assessment.

The primary purpose of this section is to support quantitative rainfall
analysis by presenting rainfall information in structured tabular
formats for state, subdivision, district, homogeneous region, and
country levels. The module facilitates detailed examination of rainfall
conditions over daily, weekly, and cumulative periods, allowing users to
assess rainfall variability and identify areas experiencing excess,
normal, or deficient rainfall.

The Rainfall Statistics section supports operational workflows by
enabling users to:

-   Generate rainfall statistics for selected dates, weeks, or
    > cumulative periods.

-   Analyze rainfall distribution across multiple geographic levels.

-   View category-wise district distribution such as:

    -   Large Excess

    -   Excess

    -   Normal

    -   Deficient

    -   Large Deficient

    -   No Rainfall

-   Assess spatial rainfall variability and rainfall anomaly patterns.

-   Support preparation of operational rainfall reports and
    > climatological summaries.

-   Export statistical outputs in PDF and Excel formats for
    > documentation, reporting, and data sharing purposes.

The module enhances rainfall monitoring and decision-making by providing
organized statistical summaries that complement the graphical and
map-based visualization modules within iRAINS. By integrating
statistical reporting with flexible filtering and export capabilities,
the Rainfall Statistics section serves as an essential analytical tool
for meteorological operations, hydrological assessment, climate
monitoring, and rainfall trend evaluation within IMD.

---

**Features**

- Statistics table covering five geographic levels: Country, Region, State, Subdivision, and District.
- Two time-period modes: Daily (single date) and Weekly (seven-day period).
- Dual-column table showing both the current day's values and the cumulative period values side by side.
- Seven departure categories with colour-coded cells for instant visual interpretation.
- District-wise classification into Large Excess, Excess, Normal, Deficient, Large Deficient, No Rain, and Not Available.
- Export to PDF with full colour coding and IMD header.
- Export to Excel (XLSX) with styled multi-row headers and column formatting.

---

**Sub-Modules**

**Level Selector**

Users choose one of five geographic levels to define which administrative units appear as rows in the statistics table:

- **Country** — single all-India row
- **Region** — one row per homogeneous region
- **State** — one row per state
- **Subdivision** — one row per meteorological subdivision
- **District** — one row per district (most granular view)

**Period Selector**

Users choose between:

- **Daily** — statistics for a single selected date.
- **Weekly** — statistics for a seven-day period ending on the selected date. Each week begins on Thursday and ends on Wednesday, following IMD's standard weekly rainfall reporting calendar.

**Statistics Table**

The core of this section is a structured table where each row represents one geographic unit (district, subdivision, state, region, or country). For each row, the table shows two sets of columns — one for the **current day's rainfall** and one for the **cumulative period rainfall** — as follows:

| Column Group | Columns Shown |
|---|---|
| Geographic Unit | S.No., Name (district / subdivision / state / region) |
| Day | Actual (mm), Normal (mm), % Departure, Category |
| Period | Actual (mm), Normal (mm), % Departure, Category |

Each cell in the Category column is colour-coded based on the departure value, enabling immediate visual identification of rainfall anomalies across the table.

**Figure 12: iRAINS Rainfall Statistics – Category Distribution Table**

> *[Insert screenshot here]*

**PDF Export**

Generates a formatted PDF report with the IMD header, a title of "District Rainfall Distribution", the full colour-coded statistics table, and a legend page explaining each category colour. Suitable for circulation in official meteorological reports.

**Excel Export**

Generates an XLSX file titled "Districtwise Rainfall Distribution" with styled column headers, data starting from row 6, and column widths formatted for readability. Suitable for further analysis and record-keeping.

---

**Threshold Computation and Logic**

The Rainfall Statistics section applies the same Normal and Actual rainfall calculation pipeline used across iRAINS (station → district → higher-level aggregation). After Actual and Normal rainfall are determined, the Departure Percentage is computed:

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

The departure value is then classified into one of seven categories. Classification is applied in the frontend based on the departure range:

<a id="table-8"></a>

**Table 8: Rainfall Statistics – Departure Category Classification**

| Category | Code | Departure Range | Cell Colour in Reports |
|---|---|---|---|
| Large Excess | LE | +60% and above | Blue |
| Excess | E | +20% to +59% | Light Blue |
| Normal | N | −19% to +19% | Green |
| Deficient | D | −20% to −59% | Orange |
| Large Deficient | LD | −60% to −99% | Yellow |
| No Rain | NR | −100% (actual = 0) | White |
| Not Available | ND | No data | Grey |

These categories are applied to both the Day column and the Period column independently, so the same geographic unit may fall into different categories for the two time windows.

---

**Data Integration**

The Rainfall Statistics section draws data from the following sources:

- **Station Daily Data:** Daily observed rainfall from meteorological stations, aggregated upward from station to the chosen geographic level.
- **Normal Tables by Level:** Pre-stored climatological normal values (district, state, subdivision, region, country) used to compute departure.
- **Topology and Hierarchy Table:** Geographic area values and subdivision weights required for area-weighted and subdivision-weighted aggregation.
- **Calculation Exclusions Table:** Excludes stations, blocks, or districts flagged for data quality control before any aggregation is performed.

---

**Back-End Architecture**

The data flow for Rainfall Statistics follows the same multi-level aggregation pipeline used across iRAINS:

1. For the selected date or date range, station-level daily observations are retrieved and averaged per district (excluding flagged and invalid readings).
2. District values are aggregated upward to the chosen geographic level using area-weighted averaging (for state and subdivision) or subdivision-weighted averaging (for region and country).
3. Normal rainfall for the same period is retrieved from the corresponding pre-stored normal table.
4. Departure percentage is computed as `(Actual − Normal) ÷ Normal × 100` for each geographic unit.
5. The resulting rows — with actual, normal, departure, and raw data for category assignment — are returned via API to the frontend.
6. The frontend applies the category classification thresholds and colour codes, then renders the table and generates the PDF or Excel export on demand.

---

**Database Connection and Architecture**

The Rainfall Statistics section queries the following tables:

- **Station Daily Data Table:** Raw station-level observations with collection date and district assignment.
- **Normal Tables** (district, state, subdivision, region, country): Pre-stored daily normal rainfall values for each level.
- **Normal District Details Table:** Geographic hierarchy, district area values, and subdivision weights for aggregation.
- **Calculation Exclusions Table:** List of excluded entities for data quality.

All tables are in the iRAINS PostgreSQL database.

---

**Programming Environment**

Rainfall Statistics is built using **Angular** for the frontend. Tables are rendered as Angular data grids with dynamic column generation. PDF export is handled by **jsPDF** with custom cell styling for colour-coded categories. Excel export uses **xlsx-js-style** to apply header formatting and column widths. The backend API uses **Node.js** and **Express** connected to **PostgreSQL**.

---

**API Generation**

The Rainfall Statistics section uses two primary data endpoints — one for daily statistics and one for weekly statistics — both returning JSON arrays in which each element represents one geographic unit with its actual, normal, departure, and category fields. A third endpoint handles document generation for PDF and Excel exports.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/statistics/daily` | GET | Returns actual, normal, and departure values for all geographic units at the selected level for a single date |
| `/api/statistics/weekly` | GET | Returns weekly period statistics for all units at the selected level for the seven-day window ending on the specified date |
| `/api/statistics/level-options` | GET | Returns the available geographic levels and their associated geographic unit lists for populating the level selector |
| `/api/statistics/pdf` | POST | Accepts the current statistics table data and generates a colour-coded PDF report with IMD header and legend |
| `/api/statistics/excel` | POST | Accepts the current statistics table data and generates a formatted XLSX file with styled headers |

Both the daily and weekly endpoints accept `level` (country / region / state / subdivision / district) and `date` parameters. For weekly mode, the backend automatically computes the seven-day window starting from the nearest Thursday prior to the provided date, following IMD's standard weekly reporting calendar. The response for each geographic unit includes: `unitName`, `unitCode`, `actualDay`, `normalDay`, `departureDay`, `categoryDay`, `actualPeriod`, `normalPeriod`, `departurePeriod`, `categoryPeriod`. Category codes (LE, E, N, D, LD, NR, ND) are determined server-side to ensure consistent classification across all export formats.

---

**User Role and Management**

<a id="table-9"></a>

**Table 9: Rainfall Statistics – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View Daily Statistics Table | ✓ | ✓ | ✓ |
| View Weekly Statistics Table | ✓ | ✓ | ✓ |
| Select Geographic Level | ✓ | ✓ | ✓ |
| View Colour-Coded Category Cells | ✓ | ✓ | ✓ |
| Export to PDF | ✓ | ✓ | — |
| Export to Excel | ✓ | ✓ | — |

---

### **Rainfall Statistics – Operational Reference**

**Category Distribution Interpretation Guide**

The Category Distribution Table in the Rainfall Statistics section summarises the count of geographic units (districts or subdivisions, depending on the selected level) that fall into each departure category for the selected date or week. The table is structured as one row per administrative unit with colour-coded departure cells. Below is guidance for interpreting the category counts in an operational context:

| Category Count Pattern | Operational Interpretation | Recommended Action |
|---|---|---|
| Majority of units in **Normal** (−19% to +19%) | Rainfall close to seasonal expectations across most of the country | Routine monitoring; note any pockets of Excess or Deficient |
| Significant cluster of **Deficient** (−20% to −59%) units | Subdued monsoon activity in those areas | Cross-check Monsoon Activity module for circulation status |
| Multiple units in **Large Deficient** (−60% to −99%) | Persistent rainfall shortage; potential drought signal | Escalate to drought monitoring workflow |
| Many units in **Excess** or **Large Excess** | Enhanced monsoon activity; potential flood risk | Cross-reference Significant Rainfall module for station-level peaks |
| High proportion of **No Data** units | Incomplete station data submission for that date | Check Verification MC module; refresh after next half-hourly update |

**Using Daily vs. Weekly Mode**

The Rainfall Statistics section supports two time-window modes:

- **Daily Mode:** Computes Actual and Normal rainfall for a single calendar day. Best used for identifying day-specific anomalies and for inclusion in the daily morning briefing. In daily mode, a unit with no station reports for that specific day will appear as No Data even if the surrounding period has good coverage.
- **Weekly Mode:** Aggregates over the seven-day IMD standard week (Thursday–Wednesday) that includes the selected date. Weekly aggregation reduces the impact of a single missed day and provides a more stable picture of departure for inclusion in weekly reports. For cumulative seasonal analysis, users should switch to the Rainfall Departures section which supports full season-to-date cumulative views.

**Level Selection Guidance**

| Geographic Level | Use Case | Units Displayed |
|---|---|---|
| **District** | Fine-grained operational monitoring | All districts (~700+) — scroll table |
| **Subdivision** | Subdivision-scale seasonal monitoring | 36 meteorological subdivisions |
| **State** | State-level summary reporting | 36 states/UTs |
| **Region** | Regional overview (all-India context) | 5 IMD administrative regions |
| **Country** | Single all-India figure | One row: India |

**Colour Reference**

| Colour | Category | Departure Range |
|---|---|---|
| Dark Green | Large Excess | ≥ +60% |
| Light Green | Excess | +20% to +59% |
| White / Neutral | Normal | −19% to +19% |
| Light Red / Pink | Deficient | −20% to −59% |
| Dark Red | Large Deficient | −60% to −99% |
| Brown / Tan | No Rainfall | −100% (Actual = 0) |
| Grey | No Data | No valid station observations |

**Export Formats and Contents**

The Rainfall Statistics section supports two export formats for sharing or archiving statistical results:

- **PDF Export:** Generates a formatted report-quality PDF document containing the full statistics table as displayed on screen. The PDF includes the header (period, geographic level, date), column headers, and all data rows with departure category labels. The PDF is suitable for inclusion in formal bulletins and for distribution to stakeholders outside the iRAINS platform.
- **Excel Export:** Generates an `.xlsx` file containing the same data in a spreadsheet format suitable for further analysis. Each row represents one geographic unit; columns include unit name, unit code, actual rainfall, normal rainfall, departure percentage, and departure category. This format is used by forecasters who need to perform additional calculations, cross-reference with other datasets, or produce custom charts.

**Relationship to Other Modules**

The Rainfall Statistics section provides tabular departure data that is complementary to the visual outputs of other iRAINS modules. It should be used alongside:

- **Rainfall Map** — for the spatial distribution of the same departure values shown in the statistics table
- **Dashboard** — for a high-level summary with the same category distribution visualised in chart form
- **Rainfall Departures** — for cumulative departure analysis across the full season-to-date period
- **Monsoon Activity** — for context on the meteorological systems responsible for the pattern of excess or deficient units observed

---

## ***Rainfall Departures*** 

> **Purpose**

The Rainfall Departures section of iRAINS is designed to provide tabular
analysis of rainfall deviation from normal rainfall values across
different meteorological and administrative levels. This module enables
users to assess rainfall anomalies over selected periods and identify
regions experiencing excess, normal, or deficient rainfall conditions.

The primary purpose of this section is to support operational rainfall
monitoring, seasonal assessment, and climatological analysis by
presenting Weekly and Cumulative rainfall departure information in an
organized tabular format. Users can analyze rainfall departures for
different meteorological seasons such as Winter, Pre-Monsoon, Monsoon,
and Post-Monsoon at subdivision and district levels.

The Rainfall Departures section supports operational workflows by
enabling users to:

-   Analyze Weekly and Cumulative rainfall departure patterns.

-   Compare actual rainfall against climatological normal rainfall
    > values.

-   Identify areas with excess, normal, deficient, or large deficient
    > rainfall conditions.

-   Monitor seasonal rainfall performance across subdivisions and
    > districts.

-   Support preparation of operational rainfall summaries and seasonal
    > assessment reports.

-   Download rainfall departure reports in PDF format for documentation
    > and dissemination purposes.

By providing structured rainfall departure information with flexible
filtering options and downloadable reports, this module enhances the
ability of users to evaluate rainfall variability, monitor monsoon
performance, and support meteorological and hydrological decision-making
processes within IMD operations.

---

**Features**

- Departure table spanning the full selected season, with one column per week.
- Two view modes: Weekly (departure for each individual week) and Cumulative (running departure from season start).
- Two geographic resolutions: Subdivision-level and District-level.
- Four season options: Winter, Pre-Monsoon, Monsoon, and Post-Monsoon.
- Year selector for historical season analysis.
- Colour-coded cells for instant visual identification of surplus and deficit areas across weeks.
- PDF download of the full departure table with colour coding preserved.

---

**Sub-Modules**

**Mode Selector**

Users choose one of two analysis modes:

- **Weekly** — each column in the table shows the departure percentage for that specific week only, independently of other weeks. This reveals which individual weeks were anomalously wet or dry.
- **Cumulative** — each column shows the departure percentage from the beginning of the selected season up to the end of that week. This shows whether the season overall is running above or below normal at each stage.

**Map Selector**

Users choose the geographic resolution of the table rows:

- **Subdivision** — one row per meteorological subdivision. Gives a broad regional overview.
- **District** — one row per district. Provides finer spatial detail for localised analysis.

**Season Selector**

Users select one of four meteorological seasons. Weeks are automatically generated within the selected season's calendar bounds:

| Season | Calendar Period |
|---|---|
| Winter | 1 January – 28/29 February |
| Pre-Monsoon | 1 March – 31 May |
| Monsoon | 1 June – 30 September |
| Post-Monsoon | 1 October – 31 December |

**Year Selector**

Users choose the analysis year. Historical data from 1700 onwards is available for long-period seasonal comparison.

**Departure Table**

The core display is a matrix where:

- **Rows** = each subdivision or district.
- **Columns** = weekly intervals within the selected season. Column headers show the week-ending date in DD-MM-YYYY format.
- **Cell values** = departure percentage (%) for that week (Weekly mode) or cumulative departure up to that week (Cumulative mode).
- **Cell colours** = colour-coded by the departure category of that cell's value.

**Figure 13: iRAINS Rainfall Departures – Weekly Departure Table**

> *[Insert screenshot here]*

**Figure 14: iRAINS Rainfall Departures – Cumulative Departure Table**

> *[Insert screenshot here]*

**PDF Download**

Generates a formatted PDF of the full departure matrix with the colour-coded cells preserved. The PDF title includes the selected map level, mode (Weekly or Cumulative), and season. Suitable for operational circulation and archival.

---

**Threshold Computation and Logic**

**Normal Rainfall (for Departure Calculation)**

Normal rainfall for each week is retrieved from the pre-stored climatological normal tables. For weekly mode, the normal is the sum of daily normal values within that specific week. For cumulative mode, the normal is the sum of all daily normal values from season start to the end of the current week.

**Actual Rainfall (for Departure Calculation)**

Actual rainfall follows the same multi-level aggregation as all other iRAINS modules:

> **Step 1:** Station readings averaged per district per day (invalid and flagged values excluded).
> **Step 2:** District values aggregated to subdivision using area-weighted averaging — `Σ (District Actual × District Area) ÷ Σ (District Area)`.
> **Step 3 (Cumulative mode):** Running sum applied from season start date to the current week-end date.

**Departure Percentage**

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

When Normal Rainfall is zero, a substitute value of 0.01 is used. When Actual Rainfall is zero, departure is −100%.

Each departure value is classified and colour-coded as follows:

<a id="table-10"></a>

**Table 10: Rainfall Departures – Colour-Coded Category Classification**

| Category | Code | Departure Range | Cell Colour |
|---|---|---|---|
| Large Excess | LE | +60% and above | Blue |
| Excess | E | +20% to +59% | Light Blue |
| Normal | N | −19% to +19% | Green |
| Deficient | D | −20% to −59% | Orange / Red |
| Large Deficient | LD | −60% to −99% | Yellow |
| No Rain | NR | −100% (actual = 0) | White |
| Not Available | ND | No data | Grey |

---

**Data Integration**

The Rainfall Departures section uses:

- **Station Daily Data:** Observed daily rainfall at station level, aggregated upward to subdivision or district.
- **Normal Subdivision / Normal District Tables:** Pre-stored daily climatological normal values used to compute weekly or cumulative normals.
- **Topology and Hierarchy Table:** District area values and subdivision hierarchy for aggregation.
- **Season Constants:** Season start and end dates, and weekly interval boundaries, defined within the application for generating the column structure of the departure table.

---

**Back-End Architecture**

The data flow for the Rainfall Departures section is as follows:

1. The user selects a season, year, map level (subdivision or district), and mode (weekly or cumulative).
2. The frontend calculates the list of weekly end dates within the selected season using IMD's standard weekly intervals.
3. For each week, a request is sent to the backend with the week's start and end date.
4. The backend computes actual rainfall by aggregating station data to district level (daily average), then to subdivision level (area-weighted), for the requested date range.
5. Normal rainfall is retrieved from the pre-stored normal tables for the same date range and level.
6. Departure is computed as `(Actual − Normal) ÷ Normal × 100` for each subdivision or district.
7. For cumulative mode, the date range passed to the backend spans from season start to the week's end date, so cumulative values are returned directly.
8. The frontend assembles all weekly results into the departure matrix, applies colour coding, and renders the table. On PDF download, the full matrix with colours is exported.

---

**Database Connection and Architecture**

The Rainfall Departures section queries:

- **Station Daily Data Table:** Daily observed rainfall at station level.
- **Normal Sub-Division Table / Normal District Table:** Pre-stored daily normal values at subdivision and district levels.
- **Normal District Details Table:** District area values and geographic hierarchy for area-weighted aggregation.
- **Calculation Exclusions Table:** Excluded stations, blocks, and districts.

All tables reside in the iRAINS PostgreSQL database.

---

**Programming Environment**

Rainfall Departures is built using **Angular**. The departure matrix table is dynamically generated with column headers computed from season-aware weekly interval logic within the application's constants service. Colour coding is applied per-cell based on departure thresholds. PDF export is handled by **jsPDF** with full cell colour preservation. The backend uses **Node.js**, **Express**, and **PostgreSQL**.

---

**API Generation**

The Rainfall Departures section retrieves structured departure data organised as a two-dimensional matrix — geographic units as rows, time intervals (weeks or cumulative periods) as columns. The backend computes all departures for the full season in a single call, and the frontend renders the matrix without additional requests.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/departures/weekly` | GET | Returns the full weekly departure matrix for all subdivisions or districts for the selected season and year |
| `/api/departures/cumulative` | GET | Returns cumulative departure values for the selected season and year, with one column per cumulative period |
| `/api/departures/season-weeks` | GET | Returns the list of week date ranges for the selected season, used to populate column headers in the departure matrix |
| `/api/departures/pdf` | POST | Generates and returns a PDF of the departure table with full colour coding and IMD header |

The `weekly` endpoint accepts `season`, `year`, and `level` (subdivision or district). The response contains a nested array structure: an outer array of geographic unit objects, each containing an inner array of weekly departure entries with `weekStart`, `weekEnd`, `actual`, `normal`, `departure`, and `category` fields. The `cumulative` endpoint follows the same structure but the inner array contains cumulative period entries calculated by summing actual and normal rainfall from the season start to each period's end date. Category codes are assigned server-side using the same seven-level departure classification applied throughout iRAINS.

---

**User Role and Management**

<a id="table-11"></a>

**Table 11: Rainfall Departures – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| Select Season and Year | ✓ | ✓ | ✓ |
| Select Weekly or Cumulative Mode | ✓ | ✓ | ✓ |
| Select Subdivision or District Level | ✓ | ✓ | ✓ |
| View Colour-Coded Departure Table | ✓ | ✓ | ✓ |
| Download PDF Report | ✓ | ✓ | — |

---

### **Rainfall Departures – Operational Reference**

**Weekly vs. Cumulative Mode**

The Rainfall Departures section supports two primary analysis modes, each serving distinct operational purposes:

- **Weekly Mode:** Displays departure from normal for each IMD standard week (Thursday–Wednesday) within the selected season. Each column in the table represents one week of the season. This mode is used to track the progression of monsoon activity week by week, to identify periods of sustained excess or deficit, and to include in weekly operational bulletins.
- **Cumulative Mode:** Displays the season-to-date cumulative departure for each subdivision or district as of the selected week. Cumulative departure provides the most reliable indicator of overall seasonal performance because it averages out the variability of individual weeks. Cumulative deficit or surplus values that persist over multiple weeks signal a structurally anomalous season, which is critical information for drought and flood early warning.

**Reading the Departure Table**

The departure table in this section is structured as a matrix: rows represent geographic units (subdivisions or districts); columns represent time periods (weeks). Each cell is colour-coded according to the seven-category departure scheme. The rightmost columns typically show the season-to-date cumulative value.

| Column Type | Description | Interpretation |
|---|---|---|
| **Week columns (W1, W2, …)** | Departure (%) for that specific IMD week | Shows how each individual week performed relative to its own normal |
| **Cumulative column** | Departure (%) from season start to current week | Shows the overall seasonal trend; most important for drought/flood assessment |
| **Normal row** | Reference rainfall (mm) for each week | Allows users to contextualise which weeks are climatologically wet or dry |

**Season Boundary Reference**

| Season | Date Range | Typical Character |
|---|---|---|
| Winter | 1 January – 28/29 February | Low rainfall; normals are small; departures are highly variable in % terms |
| Pre-Monsoon | 1 March – 31 May | Convective rainfall over central and peninsular India; localized events |
| Monsoon | 1 June – 30 September | Principal rainy season; largest normals; departure analysis most meaningful |
| Post-Monsoon | 1 October – 31 December | NE monsoon active over southern peninsula; retreating SW monsoon rains elsewhere |

**Interpreting Large Percentage Departures in Low-Rainfall Seasons**

During the Winter and Pre-Monsoon seasons, some districts have very low normal rainfall values. A small absolute deviation (e.g., 2 mm) can produce a very large percentage departure (e.g., +200%). Users should always consider the absolute rainfall values (mm) alongside the departure percentage when interpreting non-monsoon season data. A Departure of +150% over a district with a normal of 1 mm indicates only 2.5 mm of actual rainfall — a meteorologically minor event. The same caution applies to cumulative departures in early monsoon weeks before substantial rainfall has accumulated.

**Subdivision Reference List (36 IMD Meteorological Subdivisions)**

| No. | Subdivision Name | Primary Region |
|---|---|---|
| 1 | Andaman & Nicobar Islands | East & NE India |
| 2 | Arunachal Pradesh | East & NE India |
| 3 | Assam & Meghalaya | East & NE India |
| 4 | Nagaland, Manipur, Mizoram & Tripura | East & NE India |
| 5 | Sub-Himalayan West Bengal & Sikkim | East & NE India |
| 6 | Gangetic West Bengal | East & NE India |
| 7 | Orissa | East & NE India |
| 8 | Jharkhand | East & NE India |
| 9 | Bihar | East & NE India |
| 10 | East Uttar Pradesh | NW India |
| 11 | West Uttar Pradesh | NW India |
| 12 | Uttarakhand | NW India |
| 13 | Haryana, Chandigarh & Delhi | NW India |
| 14 | Punjab | NW India |
| 15 | Himachal Pradesh | NW India |
| 16 | Jammu & Kashmir (Ladakh) | NW India |
| 17 | West Rajasthan | NW India |
| 18 | East Rajasthan | NW India |
| 19 | West Madhya Pradesh | Central India |
| 20 | East Madhya Pradesh | Central India |
| 21 | Chhattisgarh | Central India |
| 22 | Gujarat Region | Central India |
| 23 | Saurashtra & Kutch | Central India |
| 24 | Konkan & Goa | South Peninsula |
| 25 | Madhya Maharashtra | South Peninsula |
| 26 | Marathwada | South Peninsula |
| 27 | Vidarbha | Central India |
| 28 | Coastal Andhra Pradesh | South Peninsula |
| 29 | Telangana | South Peninsula |
| 30 | Rayalaseema | South Peninsula |
| 31 | North Interior Karnataka | South Peninsula |
| 32 | South Interior Karnataka | South Peninsula |
| 33 | Coastal Karnataka | South Peninsula |
| 34 | Kerala & Mahe | South Peninsula |
| 35 | Tamil Nadu, Puducherry & Karaikal | South Peninsula |
| 36 | Lakshadweep | South Peninsula |

**Colour Reference for Departure Table Cells**

| Colour | Category Code | Departure Range | Typical Display |
|---|---|---|---|
| Dark Green | LE | ≥ +60% | Bold dark green background |
| Light Green | E | +20% to +59% | Light green background |
| White | N | −19% to +19% | No shading (neutral) |
| Light Red | D | −20% to −59% | Light red / pink background |
| Dark Red | LD | −60% to −99% | Dark red background |
| Brown/Tan | NR | −100% (No Rain) | Brown background |
| Grey | ND | No Data | Grey background |

**PDF Report Contents**

The PDF download from the Rainfall Departures section generates a structured report document containing:
- Report title: "Rainfall Departure Report" with the selected season name and year
- Period covered: season start date to end of selected week
- Table of all subdivisions (or districts) with departure values for each week column and the season-to-date cumulative column
- IMD standard colour coding reproduced in print

This PDF is the primary deliverable used for inclusion in IMD's weekly operational bulletins and for submission to senior management and external stakeholders.

---

## ***QPF Verification Report***

> **Purpose**

The QPF Verification Report section of iRAINS is designed to provide
access to archived Quantitative Precipitation Forecast (QPF)
verification reports for performance evaluation and historical analysis
of rainfall forecasting accuracy. This module enables users to review
and assess the quality and reliability of rainfall forecasts issued by
Flood Meteorological Offices (FMOs) and the Damodar Valley Corporation
(DVC).

The primary purpose of this section is to support forecast verification,
operational assessment, and continuous improvement of forecasting
systems by maintaining a structured repository of yearly QPF
verification reports. These reports help meteorologists and operational
users analyze how closely forecasted rainfall matched observed rainfall
over different periods and regions.

The QPF Verification Report section supports operational and analytical
workflows by enabling users to:

-   Access archived QPF verification reports organized year-wise.

-   Evaluate the performance and accuracy of rainfall forecasts issued
    > by FMOs and DVC.

-   Analyze historical forecast verification statistics and trends.

-   Support operational review and quality assessment of forecasting
    > practices.

-   Assist in identifying forecasting strengths, limitations, and areas
    > for improvement.

-   Provide reference material for research, climatological studies, and
    > hydrometeorological analysis.

By maintaining a centralized archive of verification reports, this
module enhances transparency, accountability, and operational efficiency
in rainfall forecasting and supports IMD's objective of improving
forecast accuracy and decision-support services.

**Features**

- Provides access to archived Quantitative Precipitation Forecast (QPF) verification reports in PDF format.
- Organizes reports by year, currently covering 2020, 2021, and 2022.
- Supports in-browser PDF viewing through an embedded document viewer.
- Allows users to review forecast performance data without leaving the iRAINS platform.
- Serves as a permanent reference archive for meteorological and operational assessments.

**Sub-Modules**

**Year Selector**

The Year Selector allows users to navigate between archived report years. Dedicated tabs are available for 2020, 2021, and 2022. Each tab loads the corresponding QPF Verification Report for that year.

**PDF Report Viewer**

When a year is selected, the corresponding PDF document is loaded and displayed inline within the browser. The viewer renders the full report document, allowing users to scroll through pages, zoom in on charts and tables, and review forecast verification statistics without downloading the file. The 2020 report is fully operational; reports for 2021 and 2022 are archived and available for viewing when activated.

**Figure 15: iRAINS QPF Verification Report – Archive View**
> *[Insert screenshot here]*

**Data Integration**

QPF Verification Reports are stored as static PDF documents within the iRAINS application server under a dedicated assets directory. Each report is a pre-compiled document prepared by the relevant forecasting office and uploaded into the system for archival purposes. The component retrieves the PDF file directly from the server, converts it to an in-memory object URL, and passes it to the embedded viewer. No database queries are performed during report retrieval — the module functions as a document archive rather than a live data system.

**Threshold Computation and Logic**

No real-time threshold computations are performed within the QPF Verification Report section. The reports themselves contain pre-computed verification statistics, scores, and comparisons between forecasted and observed rainfall prepared by Flood Meteorological Offices (FMOs) and the Damodar Valley Corporation (DVC). Users interpret the verification metrics and performance scores documented in the archived PDF files.

**Back-End Architecture**

QPF Verification Report documents are stored as static PDF files in the application's assets folder (`/assets/pdfs/`). When a user selects a year, the Angular frontend retrieves the corresponding PDF file via an HTTP GET request. The response is received as a binary blob, converted to an in-memory object URL, and bound to the embedded PDF viewer component. No backend controller or database interaction is involved — the workflow is a direct file-fetch operation from the web server's static file store.

---

**Database Connection and Architecture**

The QPF Verification Report section does not interact with the iRAINS PostgreSQL database during normal operation. All reports are pre-compiled PDF documents stored within the web application's static asset directory. If future enhancements introduce a dynamic document management capability, a document metadata table would be introduced in the database to track available report files, their years, types, and upload timestamps.

---

**Programming Environment**

The QPF Verification Report section is built using **Angular**. Year-tab navigation is implemented as an Angular tab component. PDF viewing is handled by Angular's HTTP client fetching the PDF as a blob, creating an object URL via `URL.createObjectURL()`, and binding it to a sandboxed `<iframe>` element. The static PDF files are served by the **Node.js Express** web server as part of the application's static asset bundle.

---

**API Generation**

Because QPF Verification Reports are stored as pre-compiled static PDF files, the section requires only file-serving endpoints rather than database-querying APIs.

| Endpoint | Method | Purpose |
|---|---|---|
| `/assets/pdfs/qpf-verification-{year}.pdf` | GET | Retrieves the static QPF Verification PDF document for the specified year directly from the application's static file store |
| `/api/qpf/available-years` | GET | Returns the list of years for which QPF Verification Reports are currently available, used to enable or disable year tabs |

The `available-years` endpoint reads the contents of the `/assets/pdfs/` directory at startup and returns only the years for which corresponding PDF files are present. This prevents users from selecting tabs for years where reports have not yet been uploaded. If a report file is added to the server between deployments, the endpoint automatically reflects the new availability without requiring application code changes.

---

**User Role and Management**

<a id="table-12"></a>

**Table 12: QPF Verification Report – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View archived QPF Verification Reports | Yes | Yes | Yes |
| Switch between year tabs (2020 / 2021 / 2022) | Yes | Yes | Yes |
| View embedded PDF report in browser | Yes | Yes | Yes |
| Download PDF report to local device | Yes | Yes | Yes |

---

### **QPF Verification Report – Operational Reference**

**Purpose in the IMD Forecast Quality Chain**

The QPF Verification Report section serves as the archive and access point for formal QPF (Quantitative Precipitation Forecast) verification assessments compiled by IMD. These reports evaluate the skill of operational rainfall forecasts against observed rainfall, providing the statistical basis for forecast quality monitoring, forecaster performance assessment, and model improvement efforts.

**Scope of Archived Reports**

The QPF Verification Reports currently available in iRAINS cover:

| Report Scope | Description |
|---|---|
| **FMO QPF Verification** | Verification of quantitative precipitation forecasts issued by Flood Meteorological Offices against observed station rainfall for their respective river basins |
| **DVC QPF Verification** | Verification of forecasts issued specifically for the Damodar Valley Corporation command area, a critical flood-prone region |

**Verification Metrics Used in Reports**

QPF verification in IMD follows internationally recognized forecast verification methodology. The reports typically include:

| Metric | Description | Interpretation |
|---|---|---|
| **Probability of Detection (POD)** | Fraction of observed rain events that were forecast | Higher is better (1.0 = perfect) |
| **False Alarm Ratio (FAR)** | Fraction of forecast rain events that did not occur | Lower is better (0.0 = perfect) |
| **Critical Success Index (CSI)** | Combined measure accounting for hits, misses, and false alarms | Higher is better (1.0 = perfect) |
| **Equitable Threat Score (ETS)** | CSI adjusted for chance forecasts | Higher is better; 0.0 = no skill |
| **Bias Score** | Ratio of forecast rain frequency to observed rain frequency | 1.0 = no bias; >1.0 = over-forecast; <1.0 = under-forecast |
| **Mean Absolute Error (MAE)** | Average absolute difference between forecast and observed rainfall (mm) | Lower is better (0.0 = perfect) |
| **Root Mean Square Error (RMSE)** | Square root of average squared differences (mm) | Lower is better; penalises large errors more than MAE |
| **Correlation Coefficient** | Linear correlation between forecast and observed values | Higher is better (+1.0 = perfect); measures pattern skill |

**Threshold Categories for Rainfall Occurrence Verification**

Forecast verification is performed at multiple rainfall thresholds to assess skill at different intensity levels:

| Threshold | Meteorological Significance |
|---|---|
| ≥ 1 mm/day | Any measurable rainfall |
| ≥ 2.5 mm/day | Light rain threshold |
| ≥ 10 mm/day | Moderate rain |
| ≥ 35.6 mm/day | Significant rainfall |
| ≥ 64.5 mm/day | Heavy rainfall |
| ≥ 115.6 mm/day | Very heavy to extremely heavy rainfall |

**Temporal Coverage**

Reports are archived by year. The system organises reports into year-based tabs, currently covering the available historical archive. Users requiring verification data for years not yet archived in iRAINS should contact the IMD Hydromet Division for access to the underlying verification datasets.

**How to Use the Reports**

1. Select the year of interest from the year tabs at the top of the section.
2. Choose the report type (FMO or DVC) from the report type selector.
3. The embedded PDF viewer loads the report in the browser. Use the scroll controls in the viewer to navigate through multi-page reports.
4. To download for offline review or sharing, click the **Download** button below the viewer.

---

## ***Rainfall Reports*** 

> **Purpose**

The Rainfall Reports section of iRAINS is designed to provide
comprehensive historical rainfall assessment and documentation for India
across multiple years, regions, and temporal scales. This module serves
as a centralized repository of detailed rainfall analysis reports
containing statistical summaries, graphical representations, and spatial
rainfall distribution maps for operational, climatological, and research
purposes.

The primary purpose of this section is to support long-term rainfall
analysis and climatological evaluation by presenting annual, seasonal,
monthly, and subdivision-wise rainfall information in a structured
report format. The reports compare observed rainfall against long-term
normal rainfall values and classify rainfall conditions into categories
such as Excess, Normal, Deficient, Scanty, and No Rainfall, enabling
users to assess rainfall variability and monsoon performance across the
country.

The Rainfall Reports section supports operational and analytical
workflows by enabling users to:

-   Access historical rainfall reports for multiple years.

-   Analyze annual, seasonal, and monthly rainfall trends across India.

-   Compare observed rainfall with climatological normal values.

-   Study rainfall departures and rainfall category distribution across
    > meteorological subdivisions and states.

-   Examine spatial rainfall variability through maps and graphical
    > visualizations.

-   Review subdivision-wise rainfall statistics and daily rainfall
    > distribution patterns.

-   Support climatological studies, operational assessments,
    > hydrological analysis, and research activities.

-   Facilitate preparation of reference materials, reports, and
    > documentation for meteorological operations.

The inclusion of detailed statistical tables, percentage departures,
rainfall category classifications, and spatial visualization products
enhances the understanding of regional and seasonal rainfall behavior
across India. By integrating historical rainfall datasets with
analytical reporting and graphical interpretation, the Rainfall Reports
section serves as an important reference tool for climate monitoring,
monsoon analysis, rainfall trend assessment, and meteorological decision
support within IMD operations.

**Features**

- Generates on-demand rainfall distribution reports in PDF format for any user-specified date range.
- Supports five geographic levels of reporting: District, State, Subdivision, Region, and Country.
- Each generated report includes Actual Rainfall, Normal Rainfall, Percentage Departure, and Rainfall Category for every geographic unit in the selected level.
- Automatically calculates and includes both the user-selected period statistics and the corresponding seasonal period statistics in a single report.
- Presents data in a hierarchically structured format — Districts nested under States, States nested under Subdivisions, Subdivisions under Regions — for easy interpretation.
- Reports are generated dynamically from live database records and can be downloaded as PDF documents.
- Colour-codes each row in the report according to the rainfall departure category for immediate visual interpretation.

**Sub-Modules**

**Date Range Selector**

Users specify a **From Date** and a **To Date** to define the period for which the rainfall report is required. The system accepts any valid date range and generates statistics for that exact period. Alongside the user-defined period, the report automatically includes seasonal totals for the season in which the selected dates fall (Winter: January–February; Pre-Monsoon: March–May; Monsoon: June–September; Post-Monsoon: October–December).

**Geographic Level Selector**

A dropdown allows the user to select the geographic level at which the report is generated. Available options are District, State, Subdivision, Region, and Country. Selecting District generates the most detailed report, with all districts presented in a hierarchical structure grouped by State and Subdivision. Selecting State or Subdivision produces summarized reports at those levels. Country-level reports provide a national summary.

**Report View and Download Panel**

After selecting the date range and geographic level, the user clicks the **View** button to trigger report generation. The system queries the live database, computes rainfall values for each geographic unit, classifies each unit into a departure category, and assembles a formatted PDF document. The generated PDF can be viewed inline in the browser or downloaded to the local device. Each report file is named with the geographic level, country code, and generation timestamp for traceability.

**Figure 16: iRAINS Rainfall Reports – Subdivision Summary Table**
> *[Insert screenshot here]*

**Figure 17: iRAINS Rainfall Reports – Spatial Rainfall Distribution Map**
> *[Insert screenshot here]*

**Data Integration**

The Rainfall Reports section draws data from the same rainfall aggregation pipeline used throughout iRAINS. Actual rainfall values are queried from the pre-aggregated district, state, subdivision, and region summary tables maintained by the backend. Normal rainfall reference values are sourced from the corresponding level-specific normal tables (`normal_district`, `normal_state`, `normal_sub_division`, `normal_region`, `normal_country`). The backend automatically determines the season boundaries for the seasonal totals based on the start date of the user-selected period. All data is retrieved as of a daily cut-off time of **07:50 UTC** to ensure consistency across reports generated on the same day.

**Threshold Computation and Logic**

Percentage departure for each geographic unit is calculated as:

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

When Normal Rainfall is zero, a substitute value of 0.01 is used to prevent division errors. When Actual Rainfall is zero, Departure is set to −100%. Departure values are then classified and colour-coded in the generated PDF according to the standard IMD seven-category scheme:

<a id="table-13"></a>

**Table 13: Rainfall Reports – Departure Category Classification**

| Category | Code | Departure Range | Row Colour in Report |
|---|---|---|---|
| Large Excess | LE | ≥ +60% | Blue |
| Excess | E | +20% to +59% | Light Blue |
| Normal | N | −19% to +19% | Green |
| Deficient | D | −20% to −59% | Red |
| Large Deficient | LD | −60% to −99% | Yellow |
| No Rain | NR | −100% (zero actual rainfall) | White |
| No Data | ND | Actual rainfall not available | Grey |

**Back-End Architecture**

When a report generation request is received, the backend controller validates the input date range and determines the season period. It then executes four parallel queries — one each for District, State, Subdivision, and Region data — fetching actual rainfall, normal rainfall, and computed departure values for the selected period and the full season. The results are passed to the relevant PDF service class (`PDFDistrictService`, `PDFStateService`, `PDFSubdivService`, `PDFRegionService`), which assembles the formatted PDF document using hierarchical layout logic. The PDF is returned as a binary buffer with the appropriate HTTP content headers, either for inline viewing or file download depending on the action parameter in the request. No intermediate file storage occurs — documents are generated on demand and streamed directly to the user's browser.

---

**Database Connection and Architecture**

The Rainfall Reports section queries multiple tables within the iRAINS PostgreSQL database:

- **Station Daily Data Table:** Source of observed station-level rainfall, aggregated to district and higher levels.
- **Normal Tables** (district, state, subdivision, region, country): Pre-stored daily normal values for departure computation.
- **Normal District Details Table:** Geographic hierarchy, area values, and subdivision weights for aggregation.
- **Calculation Exclusions Table:** Data quality exclusions applied before any aggregation.

All reports are generated dynamically from current database state, ensuring that any late corrections or updates to station data are reflected in newly generated reports.

---

**Programming Environment**

The Rainfall Reports section is built using **Angular** for the frontend. Report generation requests are dispatched from the Angular component as HTTP POST requests. PDF documents are generated server-side by **jsPDF** with custom layout and colour-coding logic. The backend service layer is built using **Node.js** and **Express**, and connects to **PostgreSQL** for all data retrieval.

---

**API Generation**

The Rainfall Reports section relies on a single PDF-generation endpoint that accepts the user's selected date range and geographic level, performs all necessary aggregation and classification server-side, and returns a ready-to-view or ready-to-download PDF document.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reports/generate` | POST | Accepts date range and level; executes all aggregation queries; assembles and returns a formatted PDF report |
| `/api/reports/levels` | GET | Returns the available geographic levels for report generation with their display names |

The `/api/reports/generate` endpoint accepts a JSON body with `startDate`, `endDate`, and `level` fields. The server determines the season boundaries from the provided start date, executes the appropriate aggregation queries for both the user-defined period and the seasonal period, classifies each geographic unit's departure into the seven-category scheme, and calls the appropriate PDF builder service. The response includes `Content-Type: application/pdf` and `Content-Disposition` headers with the suggested filename for download. Report size varies with the selected geographic level — District-level reports contain the most rows and are correspondingly the largest PDF files generated.

---

**User Role and Management**

<a id="table-14"></a>

**Table 14: Rainfall Reports – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| Select date range and geographic level | Yes | Yes | Yes |
| Generate PDF report for any period | Yes | Yes | Yes |
| View generated report inline in browser | Yes | Yes | Yes |
| Download generated PDF to local device | Yes | Yes | Yes |
| Access Country-level and Region-level reports | Yes | Yes | Yes |

---

### **Rainfall Reports – Operational Reference**

**Report Types and Temporal Coverage**

The Rainfall Reports section generates structured PDF documents that summarise rainfall performance across India for specified date ranges. The module supports multiple temporal aggregation modes:

| Report Type | Date Range | Primary Content | Typical Use |
|---|---|---|---|
| **Daily Report** | Single calendar day | Station-level and district-level actual/normal/departure for one day | Next-day operational briefing package |
| **Weekly Report** | Seven-day IMD week (Thu–Wed) | Subdivision-level weekly departure summary | IMD weekly meteorological bulletin |
| **Monthly Report** | Full calendar month | State-level and subdivision-level monthly actual, normal, departure, and category | Monthly climatological bulletin |
| **Seasonal Report** | Full IMD season (Monsoon / Pre-Monsoon / etc.) | Cumulative season-to-date performance by subdivision and district | Mid-season and end-of-season assessments |
| **Annual Report** | Full calendar year | Year-total actual, normal, and departure by state and subdivision | Annual climatological summary |

**Spatial Coverage Options**

Reports can be generated at the following geographic levels, each producing a different layout:

- **Country level:** One summary row for all-India with the rainfall normal (880.6 mm LPA for monsoon season) as reference
- **Region level:** Five rows corresponding to IMD's five administrative regions
- **State level:** One row per state/UT (36 units)
- **Subdivision level:** One row per meteorological subdivision (36 units) — standard operational level
- **District level:** One row per district (~700+ units) — detailed assessment; produces a multi-page PDF

**Standard PDF Report Structure**

Each generated PDF report follows a consistent structure:

1. **Report Header:** iRAINS logo, report title, date/period covered, generation timestamp
2. **Summary Table:** Geographic units in rows; Actual Rainfall (mm), Normal Rainfall (mm), Departure (%), and Category columns
3. **Departure Category Classification:** Colour-coded cells following IMD seven-category scheme
4. **Spatial Distribution Map:** Choropleth map showing the departure distribution visually
5. **Generation Information:** Date and time of PDF generation; data cut-off time noted

**Normal Rainfall References Used**

The normal rainfall values used in report calculations are level-specific pre-computed climatological normals stored in the iRAINS database:

| Geographic Level | Source Table | Normal Reference Period |
|---|---|---|
| District | `normal_district` | IMD long-period average (1961–2010 base) |
| State | `normal_state` | IMD long-period average |
| Subdivision | `normal_sub_division` | IMD long-period average |
| Region | `normal_region` | IMD long-period average |
| Country | `normal_country` | LPA = 880.6 mm (1961–2010 SW Monsoon) |

**Data Cut-Off for Report Consistency**

To ensure that reports generated on the same calendar day show consistent data regardless of the time of generation, all report data is drawn from the **07:50 UTC (13:20 IST)** daily snapshot. This means that:
- Reports generated after 13:20 IST for the current day will reflect the 07:50 UTC data state.
- Reports generated for past dates will reflect the final end-of-day data for those dates.
- If the 07:50 UTC snapshot was taken before all centres completed data entry (which can occur in cases of late entry), the report will undercount actual rainfall for affected districts.

**Spatial Rainfall Maps in Reports**

Each generated report includes a rendered Leaflet-based map showing departure categories as a choropleth at the selected geographic level. This map is captured server-side and embedded in the PDF. The map rendering uses the same IMD seven-category colour scheme as the Rainfall Map module, ensuring visual consistency across all output formats.

**Report Naming and File Format**

Generated PDF files are named using the pattern:
`iRAINS_Rainfall_Report_{level}_{startDate}_{endDate}.pdf`

Where `{level}` is the selected geographic level (e.g., `subdivision`), `{startDate}` and `{endDate}` are formatted as `YYYYMMDD`. The file is delivered to the browser as a download attachment.

---

## ***Spatial Distribution***

> **Purpose**

The Spatial Distribution section of iRAINS is designed to provide
interactive visualization and tabular analysis of rainfall distribution
patterns across various spatial and administrative units such as states,
subdivisions, districts, and river basins. This module enables users to
examine the spatial extent and distribution characteristics of rainfall
over selected periods, supporting operational monitoring and
meteorological assessment activities.

The primary purpose of this section is to support rainfall distribution
analysis by presenting observed rainfall, normal rainfall, percentage
departure values, and rainfall distribution categories in both tabular
and map-based formats. The module helps users identify how rainfall is
distributed geographically and classify rainfall occurrence patterns
using standard IMD spatial distribution terminology such as Dry,
Isolated, Scattered, Fairly Widespread, and Widespread.

The Spatial Distribution section supports operational and analytical
workflows by enabling users to:

-   Analyze rainfall distribution across subdivisions, states,
    > districts, and river basins.

-   View rainfall statistics for selected daily, weekly, monthly, or
    > cumulative periods.

-   Compare observed rainfall with climatological normal rainfall
    > values.

-   Assess rainfall departures and regional rainfall variability.

-   Classify rainfall occurrence based on the percentage of stations
    > receiving rainfall.

-   Search and filter specific states or subdivisions for focused
    > analysis.

-   Access structured tabular summaries and map-based rainfall
    > visualization.

-   Download rainfall reports and spatial maps in PDF and image formats
    > for reporting and dissemination purposes.

The module enhances situational awareness and operational
decision-making by integrating spatial rainfall analysis with
standardized IMD rainfall distribution classifications. By combining
interactive filtering, searchable statistical tables, and downloadable
outputs, the Spatial Distribution section serves as an important tool
for rainfall monitoring, climatological assessment, hydrological
analysis, and operational reporting within IMD's rainfall analysis
framework.

**Features**

- Displays the spatial coverage of rainfall across India at subdivision and state levels using both tabular and map-based interfaces.
- Supports two viewing modes: **Period Mode**, which aggregates rainfall occurrence data across a user-selected date range, and **Daywise Mode**, which provides a day-by-day breakdown with navigable daily records.
- Classifies each geographic unit into one of four spatial distribution categories — Isolated, Scattered, Fairly Widespread, and Widespread — based on the percentage of stations recording rainfall of 0.1 mm or more.
- Presents key station-level metrics including total stations, number of stations reporting rainfall, and the computed percentage of reporting stations for each subdivision or state.
- Provides a colour-coded Leaflet-based interactive choropleth map overlaid on a GeoJSON boundary layer of India, with distinct colours for each spatial distribution category and full-screen support.
- Allows real-time text-based search and filtering of subdivision or state names within the data table for rapid access to specific regions.
- Supports sorting of table rows by spatial distribution category in the standard meteorological order: Isolated, Scattered, Fairly Widespread, Widespread.
- Generates formal meteorological PDF reports in T/P MESSAGE format (MF-08(B) classification) suitable for official dissemination to Meteorological Centres and field offices.
- Provides Excel export of statewise departure distribution counts (counts of each departure category across states) for further analysis.
- Restricts PDF output to MC-assigned subdivisions or states when accessed by Meteorological Centre or Regional Meteorological Centre users.

**Sub-Modules**

**Mode and Level Controls**

The top control bar provides two sets of toggle buttons that define what data is loaded and how it is displayed.

The **Level Toggle** on the left side of the control bar offers two options: **Subdivision** and **State**. Selecting Subdivision loads data aggregated at the level of India's 36 meteorological subdivisions, while selecting State loads data at the state level. Each level has a dedicated backend query that counts stations within the corresponding geographic boundary.

The **Mode Toggle** on the right side switches between **Period Mode** (labelled "Period" with a chart icon) and **Daywise Mode** (labelled "Daywise" with a calendar icon). In Period Mode, users enter a start date and end date and click Submit — the system returns aggregated station statistics across the entire date range. In Daywise Mode, users enter the same date range inputs, but the system returns separate records for each individual day within the range, allowing day-by-day navigation.

**How to Use the Spatial Distribution Section — Step-by-Step**

**Step 1 — Select the Level**
At the top of the section, choose either **Subdivision** or **State** from the Level toggle. Subdivision is the standard operational level used in IMD bulletins; State level is used for state-level advisories.

**Step 2 — Select the Mode**
Choose **Period** mode to view aggregated statistics across a date range, or **Daywise** mode to view statistics for each individual day within the range.

**Step 3 — Enter the Date Range**
Specify the **Start Date** and **End Date** using the date picker fields. For daily analysis, set both dates to the same day.

**Step 4 — Click Submit**
Click the **Submit** button to load the spatial distribution table and map for the selected level, mode, and date range.

**Step 5 — Read the Table**
The table shows each subdivision or state with its Total Stations, Stations Reporting Rainfall, Percentage (%), and Category (Dry / Isolated / Scattered / Fairly Widespread / Widespread). Use the **Search** box to quickly locate a specific subdivision or state by typing its name.

**Step 6 — View the Map**
Scroll down or switch to the Map tab to see the colour-coded choropleth map. Click any polygon to view that unit's category and percentage.

**Step 7 — Navigate Day by Day (Daywise Mode only)**
If Daywise Mode was selected, use the **Previous** and **Next** buttons to step through each day in the range and observe how spatial coverage changed over time.

**Step 8 — Download the Report**
Click **PDF** to download the formal MF-08(B) distribution report for official use. Click **Download** in the Excel panel to export a state-wise departure distribution spreadsheet for offline analysis.

**Spatial Distribution Data Table**

The core of the Spatial Distribution section is a searchable, sortable data table rendered using Angular Material components. For each geographic unit (subdivision or state), the table displays the following columns:

- **Name** — The subdivision or state name, displayed in bold.
- **Total Stations** — The total number of active rainfall observation stations within the geographic unit.
- **Stations Reported Rainfall** — The count of stations that recorded at least 0.1 mm of rainfall on the selected date or across the selected period.
- **Percentage (%)** — The ratio of stations reporting rainfall to total valid stations, expressed as a percentage rounded to two decimal places. Formula: (Stations Reported Rainfall ÷ Total Stations) × 100.
- **Category** — The spatial distribution category assigned based on the percentage, displayed as a colour-coded badge.

The table includes a **Search Box** with the placeholder "Search subdivision" (or "Search state" at state level), allowing users to type any substring of a geographic unit name and instantly filter the displayed rows. The search is case-insensitive and updates the table in real time without requiring a page reload.

A dedicated **Sort by Category** button re-orders the table rows in the standard meteorological sequence: Isolated at the top, followed by Scattered, Fairly Widespread, and Widespread. The table also supports column-based sorting via Angular Material's MatSort, with ascending and descending arrows displayed on column headers. Pagination is handled by Angular Material's MatPaginator, limiting the number of rows per page for readability.

**Spatial Distribution Map View**

The Map View presents the spatial distribution data as a GeoJSON choropleth map rendered using the Leaflet.js mapping library. Each subdivision or state polygon on the map is filled with a colour corresponding to its spatial distribution category. Hovering or clicking on a polygon displays a tooltip with the geographic unit name, the spatial distribution category, and the percentage of stations reporting rainfall. The map supports full-screen mode for detailed inspection.

A colour-coded **Legend** is displayed in a fixed corner of the map, identifying each category by colour for easy reference. The legend dynamically repositions when the map enters full-screen mode. Subdivisions or states with no data for the selected period are shown in a neutral grey colour.

**Figure 18: iRAINS Spatial Distribution – Classification Table View**
> *[Insert screenshot here]*

**Figure 19: iRAINS Spatial Distribution – Distribution Map**
> *[Insert screenshot here]*

**Daywise Navigation View**

When Daywise Mode is selected, the Submit action returns a date-keyed data object rather than a single aggregated result. The interface displays the data for one day at a time and provides **Previous** and **Next** navigation buttons to step forward or backward through the days within the selected date range. The active date is shown in the table header. This mode is particularly useful for reviewing how spatial distribution changed day by day during a rainfall event or a monsoon period, enabling operational users to trace the spread and retreat of rainfall across India.

**PDF Download Panel**

The **PDF Download** button generates a formal meteorological distribution report in **T/P MESSAGE** format, following the IMD's standardised **MF-08(B)** documentation convention. The generated PDF is rendered as a landscape A4 document and includes:

- A header section with the report date, priority classification, and centre identification.
- A title line reading "MF-08(B) SUBDIVISIONWISE / STATEWISE DISTRIBUTION OF RAINFALL" followed by the date and period.
- A tabular body listing each subdivision or state alongside its Rainfall Distribution category and a Monsoon Activity classification.
- An authorization and signature block at the foot of the document.
- Automatically generated page numbers and date-time stamps in the footer.

When a user with MC or RMC role generates the PDF, the output is automatically filtered to include only the subdivisions or states assigned to that user's Meteorological Centre, ensuring that operationally sensitive information is scoped appropriately.

**Excel Download Panel**

An Excel export is available from the Departure Distribution sub-view (accessible alongside the Spatial Distribution table). Clicking the **Download** button generates an `.xlsx` file named `statewise_distribution.xlsx`. This file contains a period header row followed by a state-wise breakdown of the count of districts or units falling into each departure category (Large Excess, Excess, Normal, Deficient, Large Deficient, No Rain, No Data). This export is intended for offline analysis, summary reporting, and integration with other data tools used within IMD.

**Data Integration**

The Spatial Distribution section retrieves its data from the `station_daily_data` table, joining it with station metadata in `station_details` and geographic boundary metadata in `normal_district_details`. For each station, the backend checks whether the recorded rainfall value for the relevant date or dates is at least 0.1 mm. Stations with a recorded value of −999.9 are treated as having no valid data and are excluded from the percentage calculation. Stations with a valid value of zero (no rain) are counted as valid but not as "reporting rainfall."

For Period Mode, the backend aggregates across the full date range: a station is counted as reporting rainfall for that period if it recorded ≥ 0.1 mm on **any** day within the range. Total valid stations are those that have at least one non-null, non-sentinel reading within the period. For Daywise Mode, the aggregation is performed separately for each individual date, and the results are packaged into a date-keyed response object for efficient consumption by the frontend navigation logic.

Normal rainfall values are not used in the spatial distribution percentage calculation itself — the computation is purely station-count based. However, the companion departure distribution sub-view does use the standard rainfall aggregation pipeline and pre-stored normal values from the `normal_district`, `normal_state`, and `normal_sub_division` tables to compute departure percentages displayed alongside the spatial statistics.

**Threshold Computation and Logic**

Spatial distribution is computed using a single formula applied uniformly across all geographic units and levels:

> **Spatial Distribution (%) = ( Stations Reporting Rainfall ≥ 0.1 mm ) ÷ ( Total Valid Stations ) × 100**

The result is rounded to two decimal places. The percentage is then classified into one of four categories using the following criteria, as implemented in the backend controller:

<a id="table-15"></a>

**Table 15: Spatial Distribution Classification Criteria**

| Category | Percentage of Stations Reporting Rainfall |
|---|---|
| Isolated | 0% to 25% |
| Scattered | More than 25% to 50% |
| Fairly Widespread | More than 50% to 75% |
| Widespread | More than 75% |

The classification boundary thresholds are strictly applied: the upper bound of each category is inclusive for the lower categories and exclusive for the upper categories. For example, a value of exactly 25% is classified as Isolated, while a value of 25.01% is classified as Scattered. Geographic units with no valid station data for the selected period are shown with no category and displayed in grey on the map.

**Map Colour Coding**

Each spatial distribution category is assigned a distinct colour on the choropleth map, chosen for visual clarity and contrast:

| Category | Map Colour Code | Appearance |
|---|---|---|
| Isolated | #03ff3f | Bright Green |
| Scattered | #00683a | Dark Green |
| Fairly Widespread | #00fcf1 | Cyan |
| Widespread | #3400f6 | Blue |
| No Data | #c0c0c0 | Light Grey |

**Back-End Architecture**

The backend controller for Spatial Distribution (`SpatialDistribution.js`) provides two separate export functions: `getSpatialDistributionData` for subdivision-level analysis and `getSpatialDistributionDataState` for state-level analysis. Both functions follow the same structural pattern but differ in their joining logic to match the respective geographic boundaries.

When a request is received, the controller first parses the query parameters to determine whether a single date, a period range, or a daywise breakdown is requested. For single-date and period requests, the controller executes a PostgreSQL query that uses a Common Table Expression (CTE) to count, for each subdivision or state, the total number of active stations and the number of those stations that recorded a rainfall value of at least 0.1 mm within the specified date or date range. The result also computes the percentage, applies the category classification using a CASE expression, and returns a flat array of records.

For daywise requests, the query is executed for each date in the range and the results are assembled into a date-keyed object. This structure allows the frontend navigation to access any day's data directly by key lookup rather than filtering, ensuring responsive day-by-day pagination without additional server requests.

The backend joins the `station_daily_data` table with `station_details` (for station-to-district and station-to-subdivision mapping) and `normal_district_details` (for subdivision and state boundary assignments). Stations with the null sentinel value (−999.9) are excluded via a NULLIF or COALESCE guard in the SQL query. The percentage computation is performed in SQL using integer division with explicit DECIMAL casting and rounding to two decimal places.

**Programming Environment**

The Spatial Distribution frontend components are built using **Angular 16** with **Angular Material** components for the data table, paginator, and sort controls. The map is rendered using **Leaflet.js** with custom GeoJSON layers loaded from static boundary files maintained in the application assets. PDF generation uses **jsPDF** for formal T/P MESSAGE layout construction, and Excel export uses the **XLSX** library (SheetJS) for generating `.xlsx` files. The backend is implemented in **Node.js** with the **Express** framework, using the **pg** library for PostgreSQL queries.

**API Generation**

**Table: Spatial Distribution – API Endpoints**

| Method | Endpoint | Parameters | Purpose |
|---|---|---|---|
| GET | /api/v1/getSpatialDistributionData | ?date= or ?startDate=&endDate= (&mode=daywise optional) | Retrieve subdivision-level spatial distribution |
| GET | /api/v1/getSpatialDistributionDataState | Same as above | Retrieve state-level spatial distribution |

**User Role and Management**

<a id="table-16"></a>

**Table 16: Spatial Distribution – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View subdivision-level spatial distribution table | Yes | Yes | Yes |
| View state-level spatial distribution table | Yes | Yes | Yes |
| Switch between Period Mode and Daywise Mode | Yes | Yes | Yes |
| Search and filter geographic units by name | Yes | Yes | Yes |
| Sort table by spatial distribution category | Yes | Yes | Yes |
| View Leaflet choropleth map | Yes | Yes | Yes |
| Navigate day by day in Daywise Mode | Yes | Yes | Yes |
| Download PDF report (full national scope) | Yes | No | No |
| Download PDF report (MC-assigned scope only) | Yes | Yes | No |
| Download Excel (statewise departure distribution) | Yes | Yes | No |

---

### **Spatial Distribution – Operational Reference**

**Classification Method**

Spatial distribution is calculated independently for each geographic unit (subdivision or state) as the percentage of active stations within that unit that report a rainfall value of 0.1 mm or more for the selected date or period. The five classification thresholds used by IMD are:

| Category | % of Stations Reporting Rainfall | Operational Meaning |
|---|---|---|
| **Dry** | 0% – 10% | Essentially no rainfall in the unit; isolated stations may have trace amounts |
| **Isolated** | 11% – 25% | Very sparse rain; less than a quarter of stations report meaningful rainfall |
| **Scattered** | 26% – 50% | Patchy rainfall; less than half of stations receive rain — common in break monsoon periods |
| **Fairly Widespread** | 51% – 74% | Majority of stations receiving rain; active monsoon or active depression |
| **Widespread** | 75% and above | Near-universal coverage; vigorous monsoon conditions or well-organized weather system |

**Period Mode vs. Daywise Mode**

The Spatial Distribution section operates in two modes that serve different analytical purposes:

- **Period Mode:** Computes spatial distribution over a multi-day window (typically weekly or cumulative season-to-date). In this mode, a station is counted as "reporting rainfall" if it reports rain on at least one day in the period. This mode tends to produce higher spatial distribution values than single-day analysis because intermittent stations that rained on even one day count as active.
- **Daywise Mode:** Shows spatial distribution for each individual day within the selected period, allowing users to step through the period day by day. This mode reveals the day-to-day variability in spatial coverage and is particularly useful for identifying the exact dates of active vs. break phases during the monsoon.

**Interpreting Spatial Distribution in the Monsoon Season**

During the Southwest Monsoon (June–September), spatial distribution is the primary indicator of whether a monsoon system is active, normal, or in a break phase:

| Monsoon Phase | Expected Spatial Distribution | Accompanying Rainfall Departure |
|---|---|---|
| **Active Monsoon** | Widespread (>75%) over most central and peninsular subdivisions | Excess to Large Excess in affected subdivisions |
| **Normal Monsoon** | Fairly Widespread (51–74%) over most of the country | Near-Normal (−19% to +19%) departure |
| **Break Monsoon** | Isolated to Scattered (<50%) over most of central India; Widespread over NE and foothills | Deficient to Large Deficient over central India |
| **Onset Period** (early June) | Isolated to Scattered advancing northward from Kerala | Excess in Kerala, Deficient elsewhere |
| **Withdrawal Period** (September onwards) | Gradually decreasing coverage from NW India eastward | Progressive deficit in NW India |

**Station Coverage Consideration**

The spatial distribution percentage is computed only over stations that are considered "active" for the selected date — stations with a valid submission (including a value of 0.0 mm) are included in the denominator. Stations for which no data was submitted (value = −999.9) are excluded from both numerator and denominator. This means that in areas where data submission is incomplete (before the 11:30 IST daily update cycle), spatial distribution values may be artificially low. Users should be cautious when interpreting Daywise Mode for very recent dates before the majority of centres have completed data entry.

**Multi-Level Analysis**

The Spatial Distribution section supports two geographic levels for the primary table:

- **Subdivision Level:** Displays spatial distribution for each of the 36 IMD meteorological subdivisions. This is the standard level used for operational monsoon monitoring and for inclusion in the daily meteorological bulletin.
- **State Level:** Displays spatial distribution aggregated to the state level. Useful for state-level advisories and for coordination with state disaster management authorities.

**Map View and Legend**

The Leaflet choropleth map in the Spatial Distribution section uses the five-category colour scheme:

| Colour | Category |
|---|---|
| Dark Brown / Dark Grey | Dry (0–10%) |
| Light Yellow | Isolated (11–25%) |
| Light Green | Scattered (26–50%) |
| Medium Green | Fairly Widespread (51–74%) |
| Dark Green | Widespread (≥75%) |

The map can be toggled between the Subdivision boundary view and the State boundary view. In Daywise Mode, the map updates dynamically as the user steps forward or backward through the date range.

**Download Formats**

The PDF download from the Spatial Distribution section generates a structured report that includes:
- Date or period covered
- Subdivision-level and state-level spatial distribution tables with categories
- Colour-coded cells matching the on-screen display
- IMD classification legend

The Excel download generates a file with one row per state, with columns for state name, total station count, stations with rainfall, percentage reporting, and spatial distribution category. This file is used for offline analysis and can be incorporated into automated reporting workflows.

---

## ***Monsoon Activity***

> **Purpose**

The Monsoon Activity section of iRAINS is designed to provide
visualization and analysis of monsoon intensity and rainfall activity
across India using standardized IMD monsoon classification criteria.
This module enables users to monitor daily monsoon conditions through
colour-coded maps and tabular summaries that represent the prevailing
monsoon activity status over different regions.

The primary purpose of this section is to support operational monsoon
monitoring, rainfall assessment, and weather analysis by categorizing
rainfall activity into descriptive monsoon classes such as Weak, Normal,
Active, Vigorous, and Subdued Monsoon conditions. These classifications
are based on rainfall intensity relative to climatological normal values
and associated atmospheric conditions.

The Monsoon Activity section supports operational and analytical
workflows by enabling users to:

-   Monitor daily monsoon activity conditions across India.

-   Visualize monsoon intensity through colour-coded thematic maps.

-   Identify regions experiencing weak, active, vigorous, or subdued
    > monsoon conditions.

-   Access tabular summaries corresponding to map-based monsoon
    > classifications.

-   Analyze rainfall activity relative to normal monsoon conditions.

-   Support forecasting, hydrological monitoring, and disaster
    > preparedness activities during the monsoon season.

-   Download maps and tabular outputs separately for operational
    > reporting and dissemination purposes.

The module enhances meteorological situational awareness by integrating
spatial visualization with standardized monsoon activity criteria,
allowing operational users to quickly interpret the status and intensity
of monsoon rainfall across different regions. By providing accessible
and structured monsoon activity information, this section serves as an
important operational tool for rainfall monitoring, seasonal analysis,
and meteorological decision-making within IMD.

**Features**

- Classifies the prevailing monsoon activity status at subdivision and district levels across India using a multi-criteria classification algorithm based on rainfall intensity, spatial coverage, and heavy rain station counts.
- Presents monsoon activity as a colour-coded interactive choropleth map using Leaflet.js, enabling rapid visual assessment of regional monsoon intensity.
- Displays a detailed tabular summary alongside the map, listing Actual Rainfall (mm), Normal Rainfall (mm), the Rainfall Ratio (R = Actual ÷ Normal), and the computed Activity category for each subdivision or district.
- Supports toggling between **Subdivision** level (36 meteorological subdivisions) and **District** level (more granular, over 700 districts) for multi-resolution analysis.
- Provides historical monsoon activity trend analysis through three time-window options: **Today** (single-day pie chart showing activity distribution), **Last 7 Days** (stacked column chart), and **Last 30 Days** (stacked column chart), all built with Highcharts.
- Implements context-sensitive activity classification thresholds that distinguish between **Southwest Monsoon** (June 1 – September 30) and **Northeast Monsoon** (October 1 – May 31) seasons, with different heavy-rain requirements for West Coast and East Coast subdivisions.
- Excludes the Bay Islands (Andaman and Nicobar) and the Arabian Sea Islands (Lakshadweep) from activity classification, in accordance with IMD operational guidelines.
- Supports four separate download options: Map JPEG image, Map PDF document, Tabular data PDF, and Statistics PDF — allowing operational users to distribute both visual and data-driven products independently.
- Applies the Subdued Monsoon category when both the current day and the previous day show suppressed rainfall activity — a two-day persistence criterion that prevents single-day anomalies from triggering a suppressed classification.
- Provides a Status/Reason column in the data table that explains the textual rationale behind each activity classification, aiding operational interpretation.

**Sub-Modules**

**Date Selector and Level Toggle**

The interface begins with a control row containing a **Date Selector** (labelled "Select Date") that accepts a calendar input with the maximum value set to today's date, preventing the selection of future dates. Adjacent to the date selector is a **Level** dropdown with two options: **Subdivision** and **District**. Selecting either option and clicking the **Submit** button triggers the data fetch for the chosen combination of date and level. The system fetches data for the selected date as well as the immediately preceding date, as the classification algorithm requires the previous day's conditions to determine whether the Subdued category applies.

**Monsoon Activity Map View**

The map occupies the left panel of the interface and is rendered using **Leaflet.js** with GeoJSON polygon layers. Each subdivision or district polygon is filled with a colour corresponding to its computed monsoon activity category. A fixed **Legend** in the corner of the map identifies each activity level by colour. Hovering over or clicking a polygon triggers a tooltip that displays the geographic unit's name and its current monsoon activity status alongside the Rainfall Ratio value.

The map supports **full-screen mode** via a dedicated control, expanding to occupy the full browser viewport for detailed regional inspection. The legend and controls reposition dynamically when full-screen mode is activated. Geographic units for which no valid rainfall data is available for the selected date are rendered in light grey.

**Figure 20: iRAINS Monsoon Activity – Activity Classification Map**
> *[Insert screenshot here]*

**Monsoon Activity Data Table**

The data table occupies the right panel and presents a row for every active subdivision or district. Each row contains the following columns:

- **Subdivision / District** — The name of the geographic unit.
- **Activity** — The computed monsoon activity category, displayed as a colour-coded badge with a label (Vigorous, Active, Normal, Weak, or Subdued).
- **Avg Actual (mm)** — The average actual rainfall recorded across all stations in the unit for the selected date, expressed in millimetres to one decimal place.
- **Normal (mm)** — The climatological normal rainfall for the unit on the corresponding date, expressed in millimetres to one decimal place.
- **Ratio (R)** — The rainfall ratio computed as Avg Actual ÷ Normal, expressed to two decimal places.
- **Status** — A brief descriptive text string explaining the classification rationale (e.g., "R < 0.5 – Weak", "R > 4.0 + Widespread – Vigorous").

Row background colours follow Angular Bootstrap table variants: Vigorous rows use a light red background (table-danger), Active rows use a light amber background (table-warning), Normal rows use a light green background (table-success), Weak rows use a light grey background (table-light), and Subdued rows use a muted secondary background.

**Figure 21: iRAINS Monsoon Activity – Tabular Summary**
> *[Insert screenshot here]*

**Historical Trend Charts**

The chart area provides three time-window views of monsoon activity distribution, selectable through a button group labelled **Today**, **Last 7 Days**, and **Last 30 Days**.

- **Today View:** A **Pie Chart** showing the count of subdivisions or districts falling into each activity category on the selected date. Each slice is coloured to match the corresponding activity and labelled with the category name and count. This gives a snapshot of the nationwide distribution of monsoon intensity for the day.

- **Last 7 Days View:** A **Stacked Column Chart** with one column per day over the past seven days. Each column is subdivided into coloured stacks representing the count of subdivisions or districts in each activity category. The X-axis shows dates in MM-DD format, rotated at −45° for readability. This view reveals whether monsoon activity has been intensifying, persisting, or weakening over the recent week.

- **Last 30 Days View:** The same stacked column format extended to the past 30 days, providing a seasonal trend perspective. This view is particularly valuable during the onset, peak, and withdrawal phases of the monsoon to track the evolution of monsoon intensity nationally.

All charts are built with the **Angular-Highcharts** library and include a common colour legend for the five activity categories.

**Download Panel**

The Monsoon Activity section provides four separate download functions, each targeting a different output format or use case:

1. **Map Download (JPEG):** Captures the current map view as a high-resolution JPEG image at 8× scale with 95% quality. The output file is named `MONSOON_ACTIVITY_MAP_INDIA.jpeg`. Control buttons and UI chrome elements are excluded from the captured image.

2. **Map PDF Download:** Converts the captured map JPEG into a landscape-oriented PDF document, with the map image centered and scaled to fit the page. The output file is named `MONSOON_ACTIVITY_MAP_INDIA.pdf`. This format is suitable for inclusion in official operational bulletins and reports.

3. **Table Download (PDF):** Generates a PDF document containing the full tabular summary of monsoon activity data for the selected date and level. The output includes the date header, geographic unit names, activity category, average actual rainfall, normal rainfall, and rainfall ratio. The document is formatted for official circulation.

4. **Statistics Download (PDF):** Generates a supplementary statistics PDF that may include broader summary counts, subdivision-wise statistics, and additional operational information drawn from the data entry system.

**Data Integration**

The Monsoon Activity computation draws from multiple data sources maintained within the iRAINS database. The primary source of actual rainfall values is the `station_daily_data` table, from which the system retrieves all valid observations for the selected date and the preceding date. Station metadata — including the station's subdivision code, district code, and geographic coordinates — is sourced from `station_details`. Each station's home subdivision is used to aggregate observations to subdivision and district level averages.

Normal rainfall values for each subdivision or district on each calendar date are sourced from the corresponding level-specific normal tables. The same normal values used for departure calculations elsewhere in iRAINS are applied here to compute the Rainfall Ratio. Heavy rain station counts are computed directly from `station_daily_data` by counting the stations within each subdivision or district that exceeded specific rainfall thresholds (30 mm, 50 mm, or 80 mm) on the selected date.

For historical trend views (7-day and 30-day), the backend is called with a date array and computes the full activity classification for each date in the range. The classification is applied independently for each date, meaning the Subdued criterion (which depends on the previous day) is re-evaluated at each step. The results are returned as an array of date-keyed activity distributions, which the Highcharts components directly consume to render the stacked column trends.

**Threshold Computation and Logic**

The monsoon activity classification is a multi-step, context-dependent algorithm. The primary input is the **Rainfall Ratio (R)**, defined as:

> **R = Average Actual Rainfall per Station ÷ Normal Rainfall for the Geographic Unit**

The spatial coverage is assessed using the same spatial distribution percentage computed in the Spatial Distribution section:

> **Spatial Distribution (%) = ( Stations Reporting ≥ 0.1 mm ) ÷ ( Total Valid Stations ) × 100**

The spatial coverage is then mapped to a category using the same thresholds as the Spatial Distribution section (see Table 15). The classification algorithm then evaluates the following conditions in priority order:

<a id="table-17"></a>

**Table 17: Monsoon Activity Classification Criteria**

| Activity | Season | Conditions Required |
|---|---|---|
| **Subdued** | Both | Today: R < 1.0 AND Spatial ∈ {Isolated, Scattered} — AND Previous day had the same conditions (2-day persistence required) |
| **Weak** | Both | R < 0.5 (actual rainfall less than half of normal) |
| **Vigorous** | SW Monsoon (Jun–Sep) | R > 4.0 AND ≥ 2 stations with rainfall ≥ heavy threshold AND Spatial ∈ {Fairly Widespread, Widespread} |
| **Vigorous** | NE Monsoon (Oct–May) | R > 4.0 AND ≥ 2 stations with rainfall ≥ heavy threshold AND Spatial ∈ {Fairly Widespread, Widespread} |
| **Active** | SW Monsoon (Jun–Sep) | 1.5 ≤ R ≤ 4.0 AND ≥ 2 stations with rainfall ≥ heavy threshold AND Spatial ∈ {Fairly Widespread, Widespread} |
| **Active** | NE Monsoon (Oct–May) | 1.5 ≤ R ≤ 4.0 (no spatial or heavy-rain condition required) |
| **Normal** | Both | All other cases — R between 0.5 and 1.5, or conditions for Active/Vigorous not met |

**Heavy Rain Thresholds by Region**

The heavy rain station count thresholds differ by geographic location to account for orographic and coastal rainfall patterns:

| Region | Vigorous Threshold | Active Threshold |
|---|---|---|
| West Coast subdivisions (Konkan, Goa, coastal Maharashtra, Kerala, Coastal Karnataka, North Interior Karnataka, South Interior Karnataka) | ≥ 80 mm (8 cm) | ≥ 50 mm (5 cm) |
| North-East Coast subdivisions (Coastal Tamil Nadu, South Coastal Andhra Pradesh) | ≥ 50 mm (5 cm) | ≥ 30 mm (3 cm) |
| All other subdivisions | ≥ 30 mm (3 cm) | ≥ 30 mm (3 cm) |

The algorithm checks whether at least **two stations** within the subdivision or district exceeded the applicable heavy rain threshold on the selected date.

**Season Determination**

The system automatically determines the active monsoon season based on the calendar date:
- **Southwest (SW) Monsoon:** June 1 – September 30
- **Northeast (NE) Monsoon:** October 1 – May 31

This seasonal context governs which Active Monsoon rule is applied: the NE monsoon Active rule has a more relaxed criterion (no spatial coverage or heavy-rain station requirement) because the NE monsoon is inherently more spatially confined than the SW monsoon.

**Map Colour Legend for Monsoon Activity**

| Activity | Map Colour Code | Appearance |
|---|---|---|
| Vigorous | #ff0000 | Red |
| Active | #ff9900 | Orange |
| Normal | #00ff00 | Bright Green |
| Weak | #ffff00 | Yellow |
| Subdued | #999999 | Grey |
| No Data | #c0c0c0 | Light Grey |

**Back-End Architecture**

The backend for Monsoon Activity is implemented in the script `monsoon_activity.js`, which exports six functions corresponding to the six API endpoints. The primary single-day computation is handled by the internal function `computeMonsoonActivity` (for subdivision level) and `computeMonsoonActivityDistrict` (for district level). Both functions accept a target date and the previous date as inputs.

For each subdivision or district, the computation proceeds as follows. First, the system queries the station_daily_data table to obtain the average actual rainfall across all valid stations in the unit, the count of stations recording ≥ 0.1 mm (for spatial percentage), and the counts of stations exceeding each of the three heavy-rain thresholds (30 mm, 50 mm, 80 mm). The normal rainfall for the unit is retrieved from the pre-stored normals table. The Rainfall Ratio R is then computed, and the spatial distribution percentage is mapped to a spatial category. The `classifyActivity` function is then called with these values, along with the season flag (SW or NE) and the subdivision code, to determine the activity category using the priority-ordered criteria described in Table 17. The previous day's statistics — also fetched by the `getPrevDayStats` helper function — are evaluated when checking the Subdued condition.

For historical trend queries (7-day and 30-day), the `computeHistoricalActivitySubdiv` and `computeHistoricalActivityDistrict` functions are called with an array of dates. Each date is computed independently using the same single-day logic, producing an array of per-date activity distributions. These are returned as a structured object that the frontend Highcharts components consume to render stacked bar trends.

**Programming Environment**

The Monsoon Activity frontend component is built using **Angular 16** with **Angular-Highcharts** for trend chart rendering and **Leaflet.js** with GeoJSON for the interactive map. Download functionality for maps uses **html-to-image** to capture the Leaflet canvas at high resolution, and **jsPDF** to embed the image in a PDF. Tabular PDF generation uses the internal `MonsoonActivityDownloadService`. The backend is implemented in **Node.js** with **Express**, using the **pg** (node-postgres) library for PostgreSQL queries. Date validation and manipulation in the backend use **moment.js**.

**API Generation**

| Method | Endpoint | Body Parameters | Purpose |
|---|---|---|---|
| POST | /api/v1/monsoon-activity | { date: "YYYY-MM-DD" } | Today's activity at subdivision level |
| POST | /api/v1/monsoon-activity-district | { date: "YYYY-MM-DD" } | Today's activity at district level |
| POST | /api/v1/monsoon-activity-subdiv-last7 | { date: "YYYY-MM-DD" } | Last 7 days trend at subdivision level |
| POST | /api/v1/monsoon-activity-subdiv-last30 | { date: "YYYY-MM-DD" } | Last 30 days trend at subdivision level |
| POST | /api/v1/monsoon-activity-district-last7 | { date: "YYYY-MM-DD" } | Last 7 days trend at district level |
| POST | /api/v1/monsoon-activity-district-last30 | { date: "YYYY-MM-DD" } | Last 30 days trend at district level |

**User Role and Management**

<a id="table-18"></a>

**Table 18: Monsoon Activity – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View monsoon activity map (subdivision level) | Yes | Yes | Yes |
| View monsoon activity map (district level) | Yes | Yes | Yes |
| View tabular summary with R, actual, and normal | Yes | Yes | Yes |
| Switch between Subdivision and District levels | Yes | Yes | Yes |
| View historical trend charts (7-day and 30-day) | Yes | Yes | Yes |
| Download map as JPEG image | Yes | Yes | No |
| Download map as PDF document | Yes | Yes | No |
| Download tabular data as PDF | Yes | Yes | No |
| Download statistics PDF | Yes | Yes | No |

---

### **Monsoon Activity – Operational Reference**

**Classification Algorithm Overview**

Monsoon activity classification in iRAINS uses a multi-criteria approach that combines:

1. **Rainfall Ratio (R):** R = Actual Rainfall ÷ Normal Rainfall for the subdivision or district for the selected date
2. **Spatial Distribution Percentage:** The percentage of stations in the unit reporting rainfall ≥ 0.1 mm
3. **Heavy Rainfall Count:** The number of stations reporting rainfall above defined intensity thresholds (30 mm, 50 mm, 80 mm)

The rainfall ratio (R) is the primary determining factor. Spatial distribution and heavy rainfall counts provide supporting evidence and determine boundary cases.

**Classification Thresholds by Rainfall Ratio**

| Monsoon Category | Rainfall Ratio (R = Actual ÷ Normal) | Supporting Criteria |
|---|---|---|
| **Weak** | R < 0.5 (Actual less than half the normal) | Sparse spatial coverage; few or no heavy rainfall stations |
| **Normal** | 0.5 ≤ R < 1.5 (Half to less than 1.5× normal) | Moderate spatial coverage (Fairly Widespread or Scattered) |
| **Active** | 1.5 ≤ R ≤ 4.0 (1.5× to 4× normal) | Good spatial coverage; associated wind intensification |
| **Vigorous** | R > 4.0 (More than 4× normal) | High spatial coverage; strong winds; deep convection; many heavy rainfall stations |
| **Subdued** | Special case: suppressed rainfall with weakened circulation | Not determined by R alone — requires meteorological context |
| **No Rain** | Actual = 0 (−100% departure) | All stations reporting zero or No Data |

**Rainfall Intensity Thresholds for Heavy Rainfall Assessment**

| Threshold | IMD Classification | Significance |
|---|---|---|
| ≥ 7 mm/day | Threshold for spatial distribution counting | Minimum for "rainy day" classification |
| ≥ 30 mm/day | Significant rainfall | Used in Active monsoon assessment |
| ≥ 50 mm/day | Heavy rainfall | Key threshold for flood early warning |
| ≥ 64.5 mm/day | Very Heavy rainfall (IMD standard) | Operational bulletin-level event; triggers significant rainfall report |
| ≥ 80 mm/day | Extremely Heavy rainfall | Highest threshold used in regional monsoon activity tables |
| ≥ 115.6 mm/day | Very Extremely Heavy rainfall | Exceptional event; separately counted for area bulletins |

**Regional Monsoon Activity Reference**

Different regions of India experience the monsoon at different times and with different normal rainfall characteristics. The following reference table provides the expected seasonal context for each IMD region:

| Region | Monsoon Onset | Monsoon Withdrawal | Peak Activity Period | Climatological Character |
|---|---|---|---|---|
| South Peninsula | Late May–Early June (Kerala) | Mid-October | June–July, Oct–Nov (NE Monsoon) | SW Monsoon + NE Monsoon double maxima |
| East & NE India | Early June | Mid-October | June–August | Heaviest rainfall in India; Assam frequently Vigorous |
| Central India | Mid-June | Mid-September | July–August | Main rain-bearing region; sensitive to depression tracks |
| NW India | Late June | Early September | July | Driest region; desert conditions; extreme variability |
| South Peninsula (winter) | October–November | December | November | Northeast Monsoon dominates Tamil Nadu and coastal AP |

**Interpreting Monsoon Activity Maps**

The Monsoon Activity map uses a subdivision-level or district-level colour scheme to visualise activity classification across India simultaneously. The colour scheme is:

| Colour | Category | Description |
|---|---|---|
| Dark Blue | Vigorous | Exceptionally high rainfall relative to normal |
| Medium Blue | Active | Enhanced rainfall with associated circulation |
| Light Blue / White | Normal | Rainfall close to seasonal expectations |
| Light Yellow | Weak | Suppressed rainfall; below half the normal |
| Orange | Subdued | Suppressed activity with weakened circulation |
| Grey | No Data | No valid station data available |
| White | No Rain | Zero rainfall recorded |

**Comparison with Spatial Distribution**

Monsoon Activity and Spatial Distribution are complementary but distinct metrics:

| Metric | Measured By | Best Use |
|---|---|---|
| **Monsoon Activity** | Rainfall Ratio (Actual ÷ Normal) | Shows whether the quantum of rain is high or low relative to what is expected |
| **Spatial Distribution** | % of stations reporting rain | Shows how broadly rain is spread across a geographic unit |

A unit can be **Active** (high R) but with **Scattered** distribution (only 30% of stations reporting), which indicates that a concentrated rain event (e.g., depression-driven heavy rainfall over a narrow belt) inflated the district average while leaving most stations dry. Conversely, **Widespread** distribution with **Weak** activity indicates that many stations received light rain below normal — a pattern typical of the onset or withdrawal phases.

**7-Day and 30-Day Trend Charts**

The Monsoon Activity section includes trend charts showing how the R value for a selected subdivision has evolved over the past 7 or 30 days. These charts are used to:

- Identify whether a subdivision is entering or exiting an active spell
- Detect persistent below-normal or above-normal periods
- Provide a temporal context for the current day's classification
- Support extended range forecasting discussions by showing the recent evolution leading up to the current state

**Key Operational Uses**

- **Morning briefing:** The Monsoon Activity map is reviewed each morning alongside the Rainfall Map to provide the key characterization of the previous day's monsoon behavior for the daily bulletin.
- **Vigorous event identification:** Any subdivision classified as Vigorous should be immediately cross-checked in the Significant Rainfall module to identify specific stations with extremely heavy rainfall that require special bulletin treatment.
- **Depression tracking:** During low-pressure systems (depressions, cyclonic storms), the Active and Vigorous pattern on the Monsoon Activity map typically forms a concentrated cluster in the district-level view that can be used to track the system's position and movement.
- **Break monsoon detection:** A widespread pattern of Weak or Subdued activity across the Indo-Gangetic Plain, Central India, and Peninsular India — combined with Active/Vigorous in the foothills and NE India — is the classic signature of a break monsoon event.

---

## ***Data Entry***

> **Purpose**

The Data Entry section of iRAINS is designed to serve as the primary
operational module for entering, updating, managing, and maintaining
rainfall observation data and station information within the system.
This module enables Meteorological Centre (MC) and Regional
Meteorological Centre (RMC) users to input daily rainfall observations
for stations under their jurisdiction, while Headquarters (HQ) users are
provided with additional administrative capabilities for centralized
station management.

The primary purpose of this section is to ensure accurate, timely, and
standardized collection of rainfall data, which forms the foundation for
all downstream processes within iRAINS, including rainfall maps,
statistical analysis, reports, graphical products, and dissemination
modules. The module supports efficient operational workflows through
structured filtering, inline data entry, bulk upload functionality, and
centralized station management tools.

The Data Entry section supports operational workflows by enabling users
to:

-   Enter and update daily rainfall observations for meteorological
    > stations.

-   Filter stations using region, MC/RMC, state, district, and
    > date-based criteria.

-   Manage rainfall data through an interactive station-wise tabular
    > interface.

-   Perform rapid data entry using inline editing and keyboard
    > navigation features.

-   Export rainfall data tables in Excel format for reporting and backup
    > purposes.

-   Add, edit, and delete station metadata (HQ users only).

-   Maintain station information such as station ID, location,
    > coordinates, activation year, and station type.

-   Upload rainfall observations and station updates in bulk using
    > predefined Excel templates.

-   Ensure data consistency by applying validation rules such as date
    > restrictions and standardized missing value handling.

The module enhances operational efficiency and data quality by
supporting both manual and bulk data management processes while
maintaining centralized control over station metadata and rainfall
observations. By serving as the core data acquisition component of
iRAINS, the Data Entry section plays a critical role in supporting
rainfall monitoring, climatological analysis, operational forecasting,
and hydrometeorological reporting activities within IMD.

**Features**

- Provides a hierarchical geographic filter panel allowing users to scope data entry to specific Regions, MCs/RMCs, States, and Districts using cascading multi-select dropdowns.
- Presents an inline editable data table listing all stations for the selected geography and date, with each station's rainfall input field active for immediate editing.
- Performs real-time input validation on every rainfall entry, accepting only numeric values between 0 and 100 mm with up to one decimal place, and providing visual feedback (red background) when an invalid or out-of-range value is detected.
- Saves each individual rainfall entry automatically on blur (when the user moves focus away from the input field), without requiring an explicit Save button, ensuring that no changes are lost due to page navigation.
- Supports bulk upload of rainfall observations for multiple stations and dates via an Excel file, using a standardised template with station identifiers and date-labelled columns.
- Provides a Station Management sub-module exclusively for HQ users, enabling the addition, editing, deletion, and bulk modification of station metadata including station type, geographic coordinates, and centre assignment.
- Enforces a 60-day entry window for Meteorological Centre users, preventing editing of data older than 60 days from the current date.
- Uses an upsert (insert or update) mechanism when saving rainfall data, so that re-entering a value for an existing station–date combination updates the record without creating duplicates.
- Assigns a sentinel value of −999.9 to indicate "No Data" for stations where rainfall was not observed or reported, with a dedicated Reset button (⟳) in the data entry table to set a station's value back to this sentinel.
- Distinguishes between three station types — **AWS** (Automatic Weather Station), **ORG** (Ordinary Rain Gauge), and **ARG** (Automatic Rain Gauge) — displayed as read-only type badges in the data table.

**Sub-Modules**

**Geographic Filter Panel**

The Data Entry interface begins with a collapsible filter panel that allows users to progressively narrow the set of stations displayed in the data table. The filter panel contains the following controls:

- **Select Regions** (HQ users only): A multi-select dropdown populated with all IMD regions. HQ users can select one or more regions to scope the station list.
- **Select MCs** (HQ users only): A multi-select dropdown listing Meteorological Centres. This control is mutually exclusive with the RMC selector — selecting an MC disables the RMC dropdown and vice versa, preventing ambiguous queries.
- **Select RMCs** (HQ users only): A multi-select dropdown listing Regional Meteorological Centres, with the same mutual exclusion as the MC dropdown.
- **Select States**: A multi-select dropdown that is automatically filtered based on the selected MC or RMC. For MC and RMC users, this dropdown shows only the states associated with their assigned centre.
- **Select Districts**: A multi-select dropdown that shows districts within the selected states, allowing further refinement of the station list.
- **Date**: A date input field accepting a calendar selection. For MC users, the minimum selectable date is 60 days before today; for HQ users, any historical date can be selected.

Submitting the filter loads the matching stations into the inline data entry table.

**Inline Data Entry Table**

The data entry table is the primary working interface of this section. Each row in the table represents one active station. The table contains the following columns:

- **S.NO** — Sequential row number.
- **DISTRICT NAME** — The administrative district to which the station belongs. Clickable header for ascending/descending sort.
- **STATION ID** — The unique 13-digit hierarchical station code. Clickable header for sorting.
- **STATION NAME** — The official name of the meteorological station. Clickable header for sorting.
- **RAINFALL** — An editable numeric text field displaying the current rainfall value for the selected date. Users enter observed rainfall in millimetres. The field accepts values from 0 to 100 mm with up to one decimal place. Values above 100 mm trigger a red background and a validation alert. A **Reset button** (⟳) beside each field allows the user to set the value back to −999.9 (No Data indicator).
- **TYPE** — A read-only badge indicating the station instrumentation type: AWS, ORG, or ARG.
- **NEW / OLD** — A read-only badge indicating whether the station is a newly established station or an existing long-running station.
- **LAT° N** — Geographic latitude of the station in decimal degrees, displayed to four decimal places.
- **LNG° E** — Geographic longitude of the station in decimal degrees, displayed to four decimal places.
- **YEAR OF ACTIVATION** — The date on which the station was commissioned, formatted as DD-MM-YYYY.
- **ACTION** — Contains Edit and Delete action buttons, which are reserved for HQ administrators.

**Figure 22: iRAINS Data Entry – Station Filter and Inline Data Entry Table**
> *[Insert screenshot here]*

**Bulk Upload Panel**

The Bulk Upload feature allows users to submit rainfall observations for multiple stations across one or more dates using a single Excel file upload, instead of entering values row by row in the inline table.

The expected Excel template format includes the following columns:
- `station_name` — The station's official name (for reference only).
- `station_id` — The unique station code (primary key for matching).
- `station_code` — An alternative station identifier (first eight digits correspond to the district code).
- `centre_type` — The type of centre (MC or RMC) associated with the station.
- **Date columns** — One column per date, with the column header in the format `DD_MMM_YY` (for example, `12_Sep_24`).

When a user uploads a file, the system reads the Excel sheet, identifies the correct date column based on the selected date, and extracts the rainfall values for each station. Empty cells are automatically converted to −999.9 (No Data). Values are then transformed into the standard request format and submitted via the bulk upload API endpoint. The backend processes each station–date pair as an upsert operation, updating existing records or inserting new ones as appropriate.

**Figure 23: iRAINS Data Entry – Bulk Upload Interface**
> *[Insert screenshot here]*

**Station Management Panel (HQ Only)**

The Station Management sub-module is exclusively accessible to HQ administrators and provides full Create, Read, Update, and Delete (CRUD) control over the station registry. It is accessible via the **Add Station** and **Edit** / **Delete** action buttons in the data table.

**Add Station:** Opens a popup form with the following fields:
- Station Name (text, required)
- Station ID (numeric, required)
- MC or RMC designation (radio button: MC / RMC)
- Centre Name (required — the specific MC or RMC to which the station is assigned)
- Station Type (radio button: AWS / ORG / ARG)
- New or Old status (radio button: NEW / OLD)
- Latitude (decimal, required)
- Longitude (decimal, required)
- Year of Activation (date picker)

**Edit Station:** Pre-populates the Add Station form with the selected station's existing details, allowing any field to be modified. Changes are saved via the edit station API endpoint.

**Delete Station:** Triggers a confirmation popup before permanently removing a station from the registry.

**Bulk Edit Stations:** An Excel-based batch edit feature that exports the current station list as an Excel file, which the HQ administrator can modify offline (changing centre assignments, coordinates, or activation dates) and re-upload. The system processes each row and updates the corresponding station records in bulk.

**Figure 24: iRAINS Data Entry – Station Management Panel (HQ)**
> *[Insert screenshot here]*

**Data Integration**

All rainfall observations entered through the Data Entry section are stored in the `station_daily_data_updates` table, which serves as the operational working table for data that has been entered or modified by users but may not yet be verified. This table holds one record per station per date, with the rainfall value, a data update flag, a verification flag (`is_verified`), the verification timestamp (`verified_at`), and the ID of the user who performed verification (`verified_by`). The table uses a composite unique constraint on `(station_id, collection_date)` to enforce the one-record-per-station-per-day rule.

Station metadata is managed in the `station_details` table, which stores the station code, station name, centre assignment, station type, geographic coordinates, and activation date. All downstream modules — including Rainfall Maps, Statistics, Departures, and Spatial Distribution — draw from this station registry when performing geographic aggregations.

When a rainfall value is entered inline, it is saved immediately via the `updateStationData` endpoint on the blur event of the input field. The value is formatted to one decimal place before transmission. For bulk uploads, the Excel file is parsed on the frontend, assembled into a structured payload, and submitted to the `insertRainfallFile` endpoint, which processes the batch on the server side.

**Threshold Computation and Logic**

The Data Entry section does not compute rainfall departure or classification statistics. Its role is strictly data acquisition and quality control at the station level. The only threshold applied is the **input validation range of 0 to 100 mm**, which flags values above 100 mm with a visual alert. This limit is not a meteorological constraint but an operational data quality guard to prevent obvious entry errors. Values can still be saved after user acknowledgement if a value above 100 mm is genuinely observed.

The −999.9 sentinel value is the system-wide standard for missing or unavailable data. Any station for which no rainfall is recorded — whether because no observation was taken or because the station did not report — should have its value set to −999.9 using the Reset button or by leaving the field at its default.

**Back-End Architecture**

The backend for Data Entry is split across two controllers. `StationDataUpdates.js` handles all rainfall data read and write operations. When `fetchStationData` is called with a date, the controller queries the `station_daily_data_updates` table (joined with `station_details` and `normal_district_details`) to retrieve all stations with their current rainfall values, verification status, and metadata for the selected date. If a station has no record in the updates table for that date, it is returned with a null or default value.

The `updateStationData` function executes an upsert into `station_daily_data_updates` using PostgreSQL's `ON CONFLICT (station_id, collection_date) DO UPDATE SET data = EXCLUDED.data`. This ensures idempotent saves — repeated saves of the same value produce the same database state. Bulk uploads via `insertRainfallFile` follow the same upsert pattern but process the entire file contents in a single transaction.

Station management operations (add, edit, delete, bulk edit) are handled by `Station.js`. Adding a station inserts a new row into `station_details`; editing updates the existing row; deletion removes it (subject to any foreign-key constraints). The bulk edit feature accepts an uploaded Excel file, parses it into individual station update records, and executes batch upserts.

**Programming Environment**

The Data Entry frontend component is built with **Angular 16** using reactive forms and template-driven validation. The Excel bulk upload is processed using the **XLSX (SheetJS)** library for parsing `.xlsx` files on the frontend before submission. The backend is implemented in **Node.js** with **Express**, using the **pg** library for PostgreSQL interaction and **Multer** for handling multipart file uploads.

**API Generation**

| Method | Endpoint | Purpose | Key Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchStationData | Fetch stations with rainfall values for a date | { Date: "YYYY-MM-DD" } |
| POST | /api/v1/updateStationData | Save a single rainfall value | { date, station_code, value } |
| POST | /api/v1/insertRainfallFile | Bulk upload rainfall from Excel | Excel file (multipart/form-data) |
| POST | /api/v1/addNewStation | Add a new station to registry | Station metadata fields |
| POST | /api/v1/editStation | Update an existing station's metadata | Station metadata fields |
| POST | /api/v1/deleteStation | Remove a station from registry | { station_id } |
| POST | /api/v1/EditMultipleStations | Bulk update station metadata from Excel | Excel file (multipart/form-data) |

**User Role and Management**

<a id="table-19"></a>

**Table 19: Data Entry – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View station list with inline data entry table | Yes | Yes (own MC/RMC only) | No |
| Enter or edit rainfall values inline | Yes | Yes (own MC/RMC, within 60 days) | No |
| Reset station value to No Data (−999.9) | Yes | Yes | No |
| Bulk upload rainfall from Excel | Yes | Yes | No |
| Select Region filter | Yes | No (region shown, not selectable) | No |
| Select MC / RMC filter | Yes | No (own centre shown) | No |
| Add new station to registry | Yes | No | No |
| Edit existing station metadata | Yes | No | No |
| Delete station from registry | Yes | No | No |
| Bulk edit station metadata from Excel | Yes | No | No |

---

**Data Entry — Validation Rules Reference**

The following table documents every validation rule applied during data entry, including the condition that triggers the rule, the user-facing message or visual feedback, and the recommended action for the user.

| Rule ID | Field | Condition | System Response | Recommended Action |
|---|---|---|---|---|
| V-01 | Rainfall (mm) | Value is non-numeric (letters, symbols) | Red border on input; save blocked | Enter a valid number such as 0, 12.5, or 99.8 |
| V-02 | Rainfall (mm) | Value < 0 (not −999.9) | Red border; save blocked | Enter 0 for no rain or use the Reset button for no data |
| V-03 | Rainfall (mm) | Value > 100 mm | Red border; warning dialog shown | Confirm the reading is genuine before saving; check original gauge record |
| V-04 | Rainfall (mm) | Value = −999.9 | Accepted as No Data; displayed as "ND" | Normal — this is the correct no-data indicator |
| V-05 | Rainfall (mm) | Value = 0 | Accepted as zero rainfall (gauge empty) | Normal — station received no rain |
| V-06 | Date | Date > today | Date picker blocked; future date cannot be selected | Select today or a past date |
| V-07 | Date (MC/RMC users) | Date < (today − 60 days) | Date picker restricted; older dates not selectable | Request HQ to enter data for older dates |
| V-08 | Station Code (bulk upload) | Code not found in station_details | Row skipped; error logged in upload summary | Verify the station code against the official station list |
| V-09 | Station Code (bulk upload) | Code belongs to a different centre | Row skipped; "Not your station" error | Ensure the uploaded file contains only stations assigned to your centre |
| V-10 | Excel file (bulk upload) | File format is .xls or .csv | Upload rejected | Save the file as .xlsx before uploading |
| V-11 | Station Name (add station) | Field is empty | Form submission blocked | Enter the station's official name |
| V-12 | Station ID (add station) | Not 13 digits | Form submission blocked | Enter the full 13-digit hierarchical station code |
| V-13 | Station ID (add station) | Duplicate — code already exists | Form submission blocked with duplicate error | The code is already registered; use Edit Station instead |
| V-14 | Latitude / Longitude (add station) | Value outside India bounding box | Warning shown; save permitted | Verify coordinates against the official station registration document |

---

**Data Entry — Station Type Reference**

iRAINS supports three distinct meteorological station types, each with different instrumentation characteristics that affect how the rainfall data should be interpreted and used.

**AWS — Automatic Weather Station**

Automatic Weather Stations are electronic sensor-based platforms that record multiple meteorological parameters (temperature, humidity, wind speed, wind direction, pressure, and rainfall) automatically without human observation. Rainfall is measured using a tipping-bucket rain gauge sensor integrated into the AWS. Data from AWS stations is typically transmitted automatically to IMD's AWS central database through a communication network (GPRS, satellite, or VHF radio), but in iRAINS it may still require manual entry if direct integration is not implemented. AWS stations are identified with an orange "AWS" badge in the data entry table.

Key characteristics:
- High temporal resolution (observations available at 15-minute or hourly intervals in the original AWS system)
- iRAINS uses daily accumulated values
- Susceptible to sensor blockage (spider webs, debris) and calibration drift
- Require periodic maintenance and calibration

**ORG — Ordinary Rain Gauge**

Ordinary Rain Gauges are manual cylindrical gauges read by a trained observer, typically at 08:30 IST (corresponding to the 03:00 UTC observation) to measure the previous 24-hour accumulated rainfall. The observation is recorded in a standardised register and reported to the responsible Meteorological Centre. ORG stations form the backbone of India's long-term rainfall record and are co-located at IMD observatories, synoptic stations, and cooperative observer stations. ORG stations are identified with a blue "ORG" badge.

Key characteristics:
- Single daily reading (24-hour accumulation to 08:30 IST)
- Long historical records (many ORG stations have records extending back to the 19th century)
- Observer-dependent — reading accuracy depends on the observer's training and diligence
- Minimal equipment maintenance requirement

**ARG — Automatic Rain Gauge**

Automatic Rain Gauges are electronic rain sensors (typically tipping-bucket or weighing-type) that record rainfall automatically but are dedicated single-parameter instruments, unlike the multi-parameter AWS. ARGs are typically deployed to fill spatial gaps in the ORG network in remote areas or to provide higher-density coverage in flood-prone catchments. ARG stations are identified with a green "ARG" badge.

Key characteristics:
- Automatic recording, reduced observer dependency
- May transmit data automatically or require periodic data retrieval
- Simpler maintenance than full AWS stations

---

**Data Entry — Keyboard Navigation and Efficiency Tips**

For operators entering data for a large number of stations, the following keyboard shortcuts and workflow tips apply in the inline data entry table:

| Action | Keyboard / Control |
|---|---|
| Move to next row's rainfall field | Tab key |
| Move to previous row's rainfall field | Shift + Tab |
| Accept current entry and move down | Enter key |
| Clear field and set to No Data | Click the ⟳ Reset button |
| Sort table by District | Click "DISTRICT NAME" column header |
| Sort table by Station ID | Click "STATION ID" column header |
| Save current entry | Moving focus away from field (blur event auto-saves) |

**Efficiency Recommendations for Centre Operators:**

- Sort the table by District Name at the start of each entry session to group stations geographically. This helps when the physical register or source data is also organized by district.
- Enter all zeros first for stations with confirmed no-rain status, then go back and enter positive values. This minimises cognitive load and reduces entry errors.
- For stations that reported the same value as the previous day (e.g., during a prolonged dry spell), review the "Previous 3 Days" read-only columns before entry to confirm the pattern is expected.
- Complete a district's worth of stations before moving to the next district, rather than entering values out of order, to make cross-checking against paper records easier.
- After bulk upload, always review the upload summary for error rows. A single unrecognised station code can cause an entire district's data to be missing from the aggregation unless manually re-entered.

---

**Data Entry — 60-Day Entry Window Policy**

MC and RMC users in iRAINS are restricted to entering or editing data for dates within the past 60 days from the current date. This policy is enforced at both the date picker (which prevents selection of dates older than 60 days) and the API layer (which rejects save requests for older dates).

**Rationale for the 60-Day Window:**

The 60-day window balances two operational requirements. On one hand, centres need the flexibility to enter late observations and correct historical errors discovered during internal quality reviews — a constraint of only a few days would be too restrictive for operational reality. On the other hand, unlimited historical editing would allow alterations to data that has already been used in official climate products, reports, and assessments, creating a risk of inconsistency between the iRAINS database and archived products.

**Handling Data Corrections Beyond 60 Days:**

When a data error is identified in records older than 60 days, the correction must be initiated by an HQ user who has unrestricted access to all historical dates. The procedure is:

1. The MC identifies the error and reports it to HQ with the station code, date, incorrect value, and correct value.
2. The HQ administrator navigates to the Data Entry section, selects the historical date (which HQ can access without restriction), locates the station, and enters the corrected value.
3. The HQ administrator notes the correction in the Data Actions log with a remark explaining the source and reason for the correction.
4. If the corrected record was already verified, the HQ administrator re-verifies it.
5. If the correction affects any official report already distributed, a revised report is generated and re-distributed with a note indicating it supersedes the original.

---

**Data Entry — Common Error Messages and Resolutions**

| Error Message | Cause | Resolution |
|---|---|---|
| "Invalid rainfall value" | Non-numeric input or value outside the accepted range | Correct the entry to a valid numeric value (0–100 or leave blank for ND) |
| "Station not found" (bulk upload) | Station code in the Excel file does not match any record in station_details | Verify the station code; check for leading zeros or formatting differences |
| "Station not assigned to your centre" | The uploaded file contains a station belonging to a different MC or RMC | Remove the row from the file; report to the owning centre |
| "Date is outside your allowed entry window" | Attempting to enter data for a date older than 60 days (MC/RMC users) | Contact HQ to enter or correct data for the older date |
| "Duplicate station code" (add station) | The station code entered in Add Station already exists | Use the Edit Station function instead to modify the existing record |
| "File format not supported" (bulk upload) | Uploaded file is .xls, .csv, or another non-.xlsx format | Save the file as .xlsx and re-upload |
| "No matching date column found" (bulk upload) | The date column header in the Excel file does not match the format DD_MMM_YY | Check the column header format; the date must match exactly (e.g., 12_Sep_24) |
| "Centre code not recognized" (add station) | The entered centre code does not exist in the system's centre registry | Verify the centre code against the official list; contact the HQ administrator |
| "Save failed — server error" | Backend or database error during save | Retry; if error persists, contact the system administrator |

---

## *Significant Rainfall*

> **Purpose**

The Significant Rainfall section of iRAINS is designed to provide rapid
identification, filtering, and reporting of stations recording
significant rainfall events over a selected period. This module enables
Headquarters (HQ), Meteorological Centre (MC), and Regional
Meteorological Centre (RMC) users to efficiently isolate stations with
rainfall values exceeding specified thresholds or falling within defined
rainfall ranges, thereby supporting operational rainfall monitoring and
impact assessment activities.

The primary purpose of this section is to support timely analysis of
heavy and significant rainfall events without requiring users to
manually review complete station datasets. By allowing users to apply
customizable rainfall thresholds, date filters, regional selections, and
unit preferences, the module facilitates focused assessment of
high-impact rainfall occurrences across India.

The Significant Rainfall section supports operational workflows by
enabling users to:

-   Identify stations recording rainfall above specified threshold
    > values.

-   Filter rainfall observations using custom rainfall ranges.

-   Analyze significant rainfall events for selected dates and regions.

-   View rainfall values in either millimetres (mm) or centimetres (cm).

-   Sort and review rainfall observations in a structured tabular
    > format.

-   Focus analysis on specific IMD regions such as:

    -   Central India

    -   East and North-East India

    -   North-West India

    -   South Peninsular India

-   Export rainfall information in Excel and PDF formats for operational
    > reporting, dissemination, and documentation purposes.

The module enhances operational efficiency by enabling quick extraction
of significant rainfall information required for forecasting support,
flood monitoring, disaster preparedness, hydrological assessment, and
preparation of rainfall bulletins. By integrating threshold-based
filtering with structured reporting and download capabilities, the
Significant Rainfall section serves as an important operational tool for
identifying and communicating high rainfall events within IMD workflows.

**Features**

- Retrieves complete station-level rainfall data for a user-selected date and enables filtering based on a user-defined rainfall threshold or a custom range, allowing targeted identification of stations recording significant rainfall events.
- Supports two filter modes: **No Range** mode (stations with rainfall at or above a single threshold value) and **Custom Range** mode (stations with rainfall falling between a specified minimum and maximum value).
- Allows filtering by one or more of four major IMD meteorological regions: Central India, East and North-East India, North-West India, and South Peninsular India.
- Provides a unit toggle to display and export rainfall values in either **millimetres (mm)** or **centimetres (cm)**, with the conversion applied consistently across the data table and all download outputs.
- Displays results in a sortable table showing Meteorological Subdivision, District Name, Station Name, and Rainfall value — with clickable column headers to toggle ascending and descending sort by rainfall.
- Performs all filtering operations on the client side after retrieving the full station dataset for the selected date, enabling rapid re-filtering without additional server requests.
- Exports filtered results as an Excel spreadsheet (`Significant_RainFall_Data.xlsx`) for offline use and further analysis.
- Generates a formal PDF rainfall summary document titled "Summary of Weather" in standard IMD format, with rainfall data grouped by subdivision and expressed in centimetres.

**Sub-Modules**

**Date and Mode Selector**

The top of the Significant Rainfall interface presents a **Date Selector** (labelled "Select Date") with a calendar input. Users select the date for which significant rainfall data is to be retrieved. On date selection, the component automatically fetches the complete set of station rainfall records from the backend for the chosen date and holds the data in memory for client-side filtering.

Adjacent to the date selector, two toggle buttons switch the filter mode between **No Range** and **Custom Range**. These modes are mutually exclusive — activating one resets the inputs of the other.

**Rainfall Threshold Filter Panel**

In **No Range Mode**, a single input field labelled "Enter Rainfall Range" accepts a numeric threshold value. When the user applies the filter, the table displays only stations with a recorded rainfall value greater than or equal to the entered threshold. The unit of the threshold (mm or cm) matches the currently selected unit.

In **Custom Range Mode**, two input fields labelled **From** and **To** define a rainfall range. The filter displays stations whose rainfall falls between these two values, inclusive. The system validates that the From value is less than the To value and that neither value is negative, alerting the user if these conditions are violated.

**Region Filter**

A multi-select dropdown labelled "Select Region(s)" allows the user to restrict the results to stations within one or more of the four IMD meteorological regions:
- **Central India** (Region code 1)
- **East and North-East India** (Region code 2)
- **North-West India** (Region code 3)
- **South Peninsular India** (Region code 4)

The dropdown shows the count of selected regions in its label when multiple regions are active. Leaving all regions deselected returns all stations across India.

**Unit Toggle**

A dropdown control allows the user to switch between **mm** (millimetres) and **cm** (centimetres). All values in the results table and both download files are converted to the selected unit. Since rainfall is stored in millimetres in the database, the cm display divides each value by 10 before rendering.

**Significant Rainfall Results Table**

The filtered results are presented in a table with four columns:

- **Met Subdivision** — The meteorological subdivision to which the station belongs.
- **District Name** — The administrative district of the station.
- **Station Name** — The official name of the rainfall observation station.
- **Rainfall (mm) or Rainfall (cm)** — The recorded rainfall value for the selected date, displayed to one decimal place. The column header dynamically reflects the active unit selection. Clicking the column header toggles sort direction between ascending (▲) and descending (▼) by rainfall value.

There is no pagination — all filtered results are displayed in a single scrollable table.

**Figure 25: iRAINS Significant Rainfall – Threshold Filter and Results Table**
> *[Insert screenshot here]*

**Excel Download**

The **Download** button exports the current filtered and displayed results to an `.xlsx` file named `Significant_RainFall_Data.xlsx`. The exported columns are:
- Metsubdivision
- Station_Name
- District_Name
- Rainfall_mm or Rainfall_cm (label varies with selected unit)

This file is suitable for operational analysis, further processing, and inclusion in rainfall event reports.

**PDF Download**

The **Download Doc** button generates a formal PDF document titled **"SUMMARY OF WEATHER"** following the standard IMD rainfall bulletin format. The PDF contains:
- IMD logo and report header.
- Subtitle: "CHIEF AMOUNTS OF RAINFALL IN CM." (always in centimetres regardless of the unit toggle).
- Data grouped by meteorological subdivision, listing station name, district, and rainfall value in cm for each station within the group.
- Report date in the header.
- Page footer with document metadata.

The output filename follows the pattern `Rainfall_Summary_DD_MM_YYYY.pdf`. This document format is designed for direct use in official IMD operational bulletins.

**Data Integration**

The Significant Rainfall section retrieves its data through a single backend call to `fetchStationDatanew`, which returns the complete station dataset for the selected date — all active stations in the system with their recorded rainfall values, subdivision assignments, district names, and region codes. The response includes every station regardless of rainfall amount, including stations with −999.9 (No Data).

Once the full dataset is loaded into memory, all filtering — by threshold, range, region, and unit — is applied entirely in the browser. This client-side filtering approach allows users to change threshold values, switch modes, or add/remove regions without triggering additional server requests, making the interface highly responsive for iterative analysis.

Stations with a rainfall value of −999.9 are automatically excluded from the filtered results, as no-data records do not qualify as significant rainfall events.

**Threshold Computation and Logic**

The "significance" threshold is entirely user-defined — there is no fixed meteorological threshold hardcoded into the system. The user enters any numeric value appropriate for their operational context (for example, 50 mm to identify stations with heavy rainfall, or 100 mm to identify stations with extremely heavy rainfall). This flexibility allows the section to serve a wide range of use cases, from routine monitoring to extreme event assessment.

The unit conversion is applied as follows:
- **Display in mm:** Value stored in database is shown as-is.
- **Display in cm:** Value divided by 10, rounded to one decimal place.

The entered threshold or range is also interpreted in the selected unit. A threshold of 5 in cm mode matches stations with rainfall ≥ 50 mm (5 cm × 10).

**Back-End Architecture**

The Significant Rainfall section does not have a dedicated backend query pipeline. It reuses the general station data retrieval endpoint `/api/v1/fetchStationDatanew`, which queries `station_daily_data_updates` joined with `station_details` and `normal_district_details` to return the full dataset for a given date. The response includes station names, district names, subdivision names, region codes, and rainfall values for all stations.

All filtering, sorting, and unit conversion logic resides in the Angular frontend component (`RainfallDataCmPageComponent`). The component maintains the full dataset in memory and applies filter criteria as reactive transformations whenever the user changes filter parameters. PDF generation uses **jsPDF** with the IMD-specified layout. Excel export uses the **XLSX (SheetJS)** library.

**Programming Environment**

The Significant Rainfall component is built with **Angular 16**. PDF generation uses **jsPDF** for constructing the Summary of Weather document. Excel export uses the **XLSX** library. The backend endpoint reused here is implemented in **Node.js** with **Express** and uses the **pg** library for PostgreSQL queries.

**API Generation**

| Method | Endpoint | Purpose | Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchStationDatanew | Retrieve all station rainfall data for a date | { Date: "YYYY-MM-DD" } |

All subsequent filtering and reporting is performed client-side. No additional API calls are made for threshold changes or region filtering.

**User Role and Management**

<a id="table-20"></a>

**Table 20: Significant Rainfall – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| Select date and retrieve station data | Yes | Yes | Yes |
| Apply No Range threshold filter | Yes | Yes | Yes |
| Apply Custom Range (From–To) filter | Yes | Yes | Yes |
| Filter by IMD region | Yes | Yes | Yes |
| Toggle display unit between mm and cm | Yes | Yes | Yes |
| Sort results table by rainfall value | Yes | Yes | Yes |
| Download filtered results as Excel | Yes | Yes | No |
| Download Summary of Weather PDF | Yes | Yes | No |

---

**Significant Rainfall — IMD Intensity Classification Reference**

The Significant Rainfall section accepts any user-defined threshold, but the following IMD standard rainfall intensity classifications are the commonly used reference thresholds for setting threshold values in the module:

| Category | Daily Rainfall Range (mm) | Typical Usage in Significant Rainfall Section |
|---|---|---|
| No Rainfall | 0 mm | Set threshold = 0 to see all stations with any measurable rainfall |
| Very Light | 0.1 to 2.4 mm | Set threshold = 0.1 to identify all rain-reporting stations |
| Light | 2.5 to 15.5 mm | Operational rain-day identification |
| Moderate | 15.6 to 64.4 mm | Set threshold = 15.6 for moderate or above events |
| Heavy | 64.5 to 115.5 mm | **Set threshold = 64.5** — most common operational threshold |
| Very Heavy | 115.6 to 204.4 mm | Set threshold = 115.6 for very heavy or above warnings |
| Extremely Heavy | Above 204.4 mm | Set threshold = 204.5 for extreme event identification |

These thresholds directly align with IMD's official rainfall warning categories (Yellow, Orange, Red Watch/Warning) used in district-level weather warnings and are the values most frequently used by operational forecasters when filtering the Significant Rainfall table.

---

**Significant Rainfall — Operational Use Case Guide**

**Use Case 1: Post-Event Heavy Rainfall Inventory**

After the passage of a monsoon depression or a cyclonic storm, the HQ meteorologist opens the Significant Rainfall section, sets the date to the day of the event, and sets the threshold to 64.5 mm (heavy rainfall). They select the affected region(s) from the region filter. The resulting table shows all stations that recorded heavy rainfall, which forms the basis of the post-event rainfall inventory. The Excel download is used to archive this list. The PDF "Summary of Weather" is prepared for the Director General's briefing and for transmission to the National Disaster Management Authority (NDMA).

**Use Case 2: Identifying Flash Flood Risk Stations**

In real-time flood monitoring mode, the FMO meteorologist sets the threshold to 115.6 mm (very heavy rainfall) and the region to the catchment of interest. The resulting table shows stations recording extremely high rainfall, triggering consideration of flash flood advisories for the relevant districts. The station names and district names in the table are used to identify specific administrative units for which district-level warnings should be issued.

**Use Case 3: Rainfall Event Documentation**

For preparing climate records of extreme events — for example, a station recording the highest single-day rainfall in the season — the Custom Range mode is used with a From value equal to the record threshold (e.g., 300 mm) and a To value of 999 mm. This filters the table to show only the truly exceptional stations, which are then documented in the monthly or seasonal climate summary.

**Use Case 4: Centimetre-Based Reporting**

IMD's Summary of Weather bulletin traditionally expresses rainfall in centimetres. After filtering to the relevant stations, the user selects "cm" from the unit toggle before downloading the PDF. The generated PDF document presents all values in centimetres, formatted exactly as required for the official bulletin circulation.

---

**Significant Rainfall — Region Code Reference**

The four regions available in the region filter correspond to IMD's standard homogeneous meteorological regions:

| Region | Code | States and Union Territories Covered |
|---|---|---|
| Central India | 1 | Madhya Pradesh, Chhattisgarh, Vidarbha (Maharashtra), Telangana |
| East and North-East India | 2 | West Bengal, Bihar, Jharkhand, Odisha, Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim, Arunachal Pradesh |
| North-West India | 3 | Punjab, Haryana, Delhi, Chandigarh, Himachal Pradesh, Jammu & Kashmir, Ladakh, Rajasthan, Uttar Pradesh, Uttarakhand |
| South Peninsular India | 4 | Tamil Nadu, Puducherry, Kerala, Karnataka, Andhra Pradesh, Goa, Maharashtra (excluding Vidarbha) |

Note: The region filter uses the region code assigned to each station's station code. Stations whose 13-digit code indicates Region 1 belong to Central India, and so forth. The mapping is hierarchically encoded in the station code itself, so no separate region lookup table is needed.

---

## *Verification HQ* 

> **Purpose**

The Verification HQ section of iRAINS is designed to provide
Headquarters (HQ) and SP users with a centralized monitoring and
verification platform for tracking rainfall data entry and validation
activities across all Meteorological Centres (MCs) and Regional
Meteorological Centres (RMCs). This module enables operational users to
monitor station-wise data update status, verification progress, and
overall reporting completeness at a national scale.

The primary purpose of this section is to support centralized quality
control, operational oversight, and data verification workflows by
providing both daily and cumulative views of rainfall data submission
and verification status. The module helps ensure the accuracy,
completeness, and reliability of rainfall observations before they are
utilized in maps, statistics, reports, and dissemination products within
iRAINS.

The Verification HQ section supports operational workflows by enabling
users to:

-   Monitor station-wise rainfall data entry progress across MCs and
    > RMCs.

-   Review updated, non-updated, verified, and non-verified station
    > counts.

-   Analyze verification status for single-day and multi-day periods.

-   Access detailed drill-down station-level verification information.

-   Compare daily operational performance across multiple centres using
    > cumulative and transposed views.

-   Verify selected stations individually or perform bulk verification
    > operations.

-   Sort and filter station records for efficient operational review.

-   Generate downloadable Excel reports for daily and cumulative
    > verification analysis.

The module provides two operational modes:

-   Daily Mode: For monitoring and verifying rainfall data submission
    > status for a single date.

-   Range/Cumulative Mode: For analyzing verification trends and
    > operational performance across multiple dates.

The inclusion of transposed cumulative tables, column-based filtering,
and verification controls enhances operational efficiency and enables
rapid identification of pending or incomplete station updates. By
integrating verification management with centralized reporting and
downloadable outputs, the Verification HQ section serves as a critical
quality assurance and operational monitoring tool within the iRAINS
rainfall data management workflow.

**Features**

- Provides a centralized national-scope verification dashboard for HQ users, showing the data update and verification status of every Meteorological Centre and Regional Meteorological Centre across India.
- Offers two distinct operational modes: **Daily** mode for single-date monitoring and **Range** mode for cumulative multi-date verification tracking.
- Displays four status counts per centre in the Daily summary table — Updated Stations, Not Updated Stations, Verified Stations, and Not Verified Stations — each as a clickable drill-down button that reveals the individual station list behind that count.
- Provides an inline rainfall editing capability within the "Not Updated Stations" drill-down table, allowing HQ staff to enter missing data for stations that failed to report on the selected date.
- Supports **Bulk Verification** through two actions: **Verify Selected** (verifies user-checked stations) and **Verify All** (verifies every station in the currently filtered view), both with a confirmation prompt.
- Presents the **Cumulative (Range) view** as a transposed table where rows represent Meteorological Centres and columns represent individual dates in the selected range, with each date subdivided into four status sub-columns.
- Provides five column-visibility filters for the Range view — All, Updated, Not Updated, Verified, Not Verified — so users can focus on one aspect of the verification pipeline without visual clutter.
- Exports two types of Excel files from the Range view: a flat summary export and a transposed format matching the on-screen table layout, both including all status counts per centre per date.

**Sub-Modules**

**Daily Tab**

The Daily tab is the default view of the Verification HQ section. A **date input field** at the top defaults to today's date and can be changed to any historical date. Clicking Submit loads the verification summary for the selected date.

**Daily Summary Table**

The main Daily summary table has one row per Meteorological Centre or Regional Meteorological Centre. Columns are:

- **S.NO** — Row number.
- **MC or RMC** — The name of the Meteorological Centre or Regional Meteorological Centre (displayed as the centre type concatenated with the centre name).
- **TOTAL STATIONS** — The total number of active stations registered under that centre.
- **UPDATED STATIONS** — A clickable count badge showing the number of stations that have a rainfall value other than −999.9 for the selected date. Clicking opens a drill-down table of those stations.
- **NOT UPDATED STATIONS** — A clickable count badge for stations with −999.9 (no data entered). Clicking opens the corresponding drill-down with editable rainfall fields.
- **VERIFIED STATIONS** — A clickable badge showing the count of stations with `is_verified = 1`. Clicking opens the verified stations drill-down.
- **NOT VERIFIED STATIONS** — A clickable badge for stations that have a rainfall value but have not yet been verified (`is_verified = 0`). Clicking opens a table with checkboxes for bulk selection and verification.

**Figure 26: iRAINS Verification HQ – Daily Verification Status Table**
> *[Insert screenshot here]*

**Drill-Down Tables**

Clicking any count badge opens a detailed station-level drill-down table. Each drill-down shows a different set of columns depending on the status:

- **Updated Stations drill-down:** S.NO, District, Station Name, Station ID, Rainfall (mm), Status ("Updated").
- **Not Updated Stations drill-down:** S.NO, State Name, District, Station Name, Station ID, Rainfall (editable text field with validation), Status ("Not Updated"). HQ staff can enter missing values directly in this view.
- **Verified Stations drill-down:** S.NO, District, Station Name, Station ID, Rainfall (mm), Verified DateTime (formatted timestamp), Status ("Verified").
- **Not Verified Stations drill-down:** S.NO, District, Station Name, Station ID, Rainfall (read-only), Status (colour-coded badge — red for Not Verified), Selection checkbox. Rows can be individually checked, and bulk verification actions operate on the checked set.

**Verification Actions (Daily Mode)**

Two bulk verification buttons appear in the Not Verified drill-down:
- **VERIFY SELECTED:** Opens a confirmation dialog and, on confirmation, calls the verification API for only the checked stations. The `is_verified` flag, `verified_at` timestamp, and `verified_by` user ID are updated in the database.
- **VERIFY ALL:** Applies the same verification to every station in the current Not Verified table, regardless of checkbox state.

After successful verification, the component reloads the data for the selected date to reflect updated counts.

**Range Tab (Cumulative View)**

The Range tab enables monitoring of verification progress across a multi-day window. A **From** and **To** date input pair defines the range; clicking **Load** fetches the cumulative summary. The system validates that the start date is on or before the end date.

**Transposed Summary Table**

The Range view presents a transposed table structure that is distinct from the Daily view:

- **Rows** represent Meteorological Centres or RMCs (left-most column, sticky).
- The second column shows the **Total Stations** count for each centre (sticky).
- **Subsequent column groups** represent individual dates in the selected range. Each date group is subdivided into status sub-columns. Alternating date groups use different background colours (light blue for even positions, orange for odd) to aid visual tracking across a wide table.

Under each date, based on the active column-visibility filter, one or more of these sub-columns appear: **Updated**, **Not Updated**, **Verified**, **Not Verified**.

**Column Filter Buttons**

Five toggle buttons control which status sub-columns are visible in the Range table:
- **All** — Shows all four sub-columns under each date.
- **Updated** — Shows only the Updated count.
- **Not Updated** — Shows only the Not Updated count.
- **Verified** — Shows only the Verified count.
- **Not Verified** — Shows only the Not Verified count.

This filtering is display-only — the underlying data is retained in memory and re-rendered without a new API call when the filter changes.

**Figure 27: iRAINS Verification HQ – Cumulative Verification Summary**
> *[Insert screenshot here]*

**Excel Exports**

The Daily tab provides a **Download Excel** button that exports the current-date summary by centre (with UPDATED, NOT UPDATED, VERIFIED, NOT VERIFIED counts) to a file named `Daily_Stations_Data.xlsx`.

The Range tab provides two Excel exports:
- **Flat Export:** Exports the raw cumulative data as a flat table with columns S.NO, MC or RMC, Date, Total Stations, Updated Stations, Not Updated Stations, Verified Stations, Not Verified Stations. Filename: `Cumulative_[startDate]_to_[endDate].xlsx`.
- **Transposed Export:** Exports the transposed table as displayed on screen, with two header rows — the top row containing merged date headers and the second row containing the four status sub-column labels. Filename: `Cumulative_Transposed_[startDate]_to_[endDate].xlsx`.

Both exports use the **XLSX (SheetJS)** library with custom merge configurations for the transposed format.

**Data Integration**

The Verification HQ section draws all its data from the `station_daily_data_updates` table, joined with `station_details` for station and centre metadata. The Daily view retrieves one row per station for the selected date, including the rainfall value, update status, verification status (`is_verified`), verification timestamp (`verified_at`), and verifying user (`verified_by`). The frontend then groups these station records by Meteorological Centre to compute the summary counts displayed in the main table.

The Range (Cumulative) view uses a dedicated backend query in `Station.js` that iterates across all dates in the requested range and computes, for each MC/RMC and each date, the four status counts. This query uses a date-generation technique on the server to ensure that dates with no records at all (i.e., no data entered for any station) still appear in the summary with zero counts, maintaining completeness of the range view.

**Threshold Computation and Logic**

The Verification HQ section does not apply meteorological classification thresholds. Its logic is entirely status-based:

| Status | Definition |
|---|---|
| Updated | Station has a rainfall value ≠ −999.9 for the selected date |
| Not Updated | Station has no record or has a value = −999.9 for the selected date |
| Verified | Station has `is_verified = 1` AND a valid rainfall value ≠ −999.9 |
| Not Verified | Station has `is_verified = 0` AND a valid rainfall value ≠ −999.9 |

A station can be Updated (data entered) but Not Verified (pending QA sign-off). A station that is Not Updated is implicitly Not Verified, but it is tracked in the Not Updated counter rather than the Not Verified counter.

**Back-End Architecture**

The backend for Verification HQ uses two controllers. `StationDataUpdates.js` handles the daily station fetch (`fetchStationData`) and the multi-station verification (`verifyMultipleStationData`). When a verification request is received, the controller executes an update query on `station_daily_data_updates` setting `is_verified = 1`, `verified_at = NOW()`, and `verified_by = userId` for all matching `station_id` and `collection_date` combinations in the provided list.

The cumulative centre summary is handled by `Station.js` in the `fetchCentreStationSummary` function. This function generates all dates between `startDate` and `endDate` using a PostgreSQL CTE (Common Table Expression) with `generate_series`, then performs a cross join with the centre list to produce a complete matrix of centre × date combinations. Left joins against `station_daily_data_updates` populate the counts for each cell. The result is returned as a flat array and assembled into the transposed layout by the Angular frontend.

**Programming Environment**

The Verification HQ frontend component is built with **Angular 16**. Excel export uses the **XLSX (SheetJS)** library with custom cell merge definitions for the transposed header format. The backend verification logic is in **Node.js** with **Express**, using the **pg** library. Date range generation in the backend uses PostgreSQL's built-in `generate_series` function.

**API Generation**

| Method | Endpoint | Purpose | Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchStationData | Fetch all stations with status for a date | { Date: "YYYY-MM-DD" } |
| POST | /api/v1/fetchCentreStationSummary | Fetch cumulative summary per centre | { startDate, endDate } |
| POST | /api/v1/verifyMultipleStationData | Verify a list of stations for a date | { date, station_ids: [], userid } |
| POST | /api/v1/updateStationData | Update a missing rainfall value | { station_code, date, value } |

**User Role and Management**

<a id="table-21"></a>

**Table 21: Verification HQ – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View Daily summary table (all MCs/RMCs) | Yes | No | No |
| Drill down into any MC/RMC station list | Yes | No | No |
| Edit missing rainfall in Not Updated drill-down | Yes | No | No |
| Verify selected stations | Yes | No | No |
| Verify all Not Verified stations for a date | Yes | No | No |
| View Cumulative (Range) transposed table | Yes | No | No |
| Apply column visibility filters (All/Updated/etc.) | Yes | No | No |
| Download Daily Excel summary | Yes | No | No |
| Download Cumulative flat Excel | Yes | No | No |
| Download Cumulative transposed Excel | Yes | No | No |

---

**Verification HQ — Status Field Definitions**

The Verification HQ section uses four distinct status values to characterise each station's data state for any given date. Understanding the precise meaning of each status is essential for interpreting the daily and cumulative summary tables correctly.

| Status | Meaning | Records Shown In |
|---|---|---|
| **Updated** | A rainfall value has been saved for this station for this date. The value is currently not verified. | Daily drill-down — Updated tab |
| **Verified** | A rainfall value has been saved AND confirmed as valid by an HQ verifier. The is_verified flag is set to TRUE with a recorded timestamp. | Daily drill-down — Verified tab |
| **Not Verified** | A rainfall value exists but has been explicitly flagged or left unverified by HQ despite being available for review. This state differs from "Updated" only in that HQ has reviewed the record and chosen not to verify it yet. | Daily drill-down — Not Verified tab |
| **Not Updated / Pending** | No rainfall value has been submitted for this station for this date. The station is active and assigned to a centre, but no data entry has occurred. | Daily drill-down — Not Updated tab |

Note: Stations with a value of −999.9 (No Data sentinel) that were explicitly entered by the MC are considered "Updated" — the −999.9 entry is treated as a submitted record indicating that the station did not collect an observation. This is different from "Not Updated", which means no submission was made at all.

---

**Verification HQ — Cumulative Table Layout**

The Cumulative (Range) view displays a transposed matrix that is used to monitor verification progress over a date range. Understanding its layout is important for correctly reading the table:

- **Rows:** Each row represents one MC or RMC centre.
- **Columns:** Each column represents one date within the selected date range.
- **Cells:** Each cell shows the number of stations from that centre that were verified on that date, displayed as a fraction: **Verified / Total** (e.g., "42 / 50" means 42 out of 50 assigned stations were verified on that date).
- **Colour coding:** Cells where Verified = Total are highlighted green (full verification achieved). Cells with partial verification are highlighted amber. Cells where Verified = 0 are highlighted red (no verification completed).

This matrix format allows the HQ meteorologist to identify at a glance which centres have consistent verification gaps across the date range, which dates had widespread pending verification across all centres, and how verification performance trends over time.

---

**Verification HQ — Standard Operating Procedure (Daily Cycle)**

The following sequence describes the recommended daily verification procedure for the HQ meteorologist:

| Step | Time (Approx. IST) | Action |
|---|---|---|
| 1 | 08:30 | Log in to iRAINS. Open Verification HQ. Review the Daily summary table for the current date. |
| 2 | 08:35 | Identify centres with low Updated counts. Contact those centres if data is significantly below normal submission rates. |
| 3 | 09:00 | Begin drill-down verification for centres that have submitted data. Review each station's value. Flag any unusual readings for follow-up. |
| 4 | 09:30 | Use Bulk Verify to confirm all reviewed stations that pass the quality check. |
| 5 | 10:00 | Re-check Pending count after bulk verification. Follow up on remaining Not Verified stations. |
| 6 | 10:30 | Download the Daily Excel summary for archival record-keeping. |
| 7 | End of day | Run the Cumulative view for the past 7 days to confirm that all dates have reached target verification rates. |

---

## *Verification MC*

> **Purpose**

The Verification MC section of iRAINS is designed to support
Meteorological Centre (MC) users in reviewing, validating, and verifying
rainfall observations entered for stations under their jurisdiction.
This module serves as an important quality control and operational
validation component within the rainfall data management workflow of
iRAINS.

The primary purpose of this section is to ensure the accuracy,
completeness, and reliability of rainfall data before it is utilized in
downstream applications such as rainfall maps, statistical analysis,
reports, graphical products, and dissemination modules. By providing
station-wise verification status, summary indicators, and bulk
verification capabilities, the module enables MC users to efficiently
monitor reporting progress and validate submitted rainfall observations
for selected dates.

The Verification MC section supports operational workflows by enabling
users to:

-   Review rainfall observations entered for stations under their
    > jurisdiction.

-   Monitor reporting and verification status through summary count
    > indicators.

-   Identify stations with updated, pending, verified, or unverified
    > rainfall data.

-   Access detailed station-level rainfall information for operational
    > review.

-   Verify individual stations or perform bulk verification operations.

-   Track verification timestamps and data validation status.

-   Improve operational data quality and consistency before data
    > dissemination and analysis.

The module enhances rainfall data governance by introducing a structured
verification workflow that minimizes errors and ensures accountability
in operational rainfall reporting. By integrating summary dashboards,
sortable station tables, and verification controls, the Verification MC
section serves as a critical operational tool for maintaining
high-quality rainfall datasets within the IMD rainfall monitoring and
analysis framework.

**Features**

- Provides a focused, single-centre verification dashboard scoped automatically to the stations of the logged-in Meteorological Centre or Regional Meteorological Centre user, without requiring any manual centre selection.
- Displays a single-row summary counter panel showing the count of Total Stations, Updated Stations, Not Updated Stations, Verified Stations, and Not Verified Stations for the selected date — each as a clickable button that opens the corresponding station detail view.
- Shows an editable rainfall field in the "Not Updated Stations" drill-down, allowing MC users to enter missing observations for stations that did not report on the selected date.
- Supports individual and bulk verification of rainfall data through **Verify Selected** and **Verify All** buttons, both with confirmation dialogs.
- Displays the verification timestamp (date and time of verification sign-off) for each station in the Verified Stations drill-down.
- Colour-codes the Status column in the Not Verified drill-down to immediately flag outstanding stations in red.

**Sub-Modules**

**Date Selector and Centre Context**

At the top of the Verification MC interface, a **Date Selector** (date input field) defaults to today's date. The user can select any date within the operational window. Clicking **Submit** triggers `backend()` to reload all station data for the selected date.

Unlike the Verification HQ section, the Verification MC section does not display any centre selection controls. When the component loads, it reads the logged-in user's centre assignment from browser local storage and pre-filters all data automatically to that user's MC or RMC. The centre name (converted to uppercase) is shown as a non-interactive label for context.

**Summary Counter Panel**

A single-row summary table at the top of the data area presents five status counters:

- **TOTAL STATIONS** — Count of all active stations registered under the logged-in centre.
- **UPDATED STATIONS** — Count of stations with a rainfall value ≠ −999.9 for the selected date.
- **NOT UPDATED STATIONS** — Count of stations with a value = −999.9 (no data entered).
- **VERIFIED STATIONS** — Count of stations with `is_verified = 1` AND a valid rainfall value.
- **NOT VERIFIED STATIONS** — Count of stations with `is_verified = 0` AND a valid rainfall value.

Each counter is a clickable button. Clicking a counter replaces the summary view with the corresponding station detail drill-down table.

**Station Detail Drill-Down Tables**

Each clickable counter leads to a specific table view:

**Updated Stations Table:** Lists all stations that have submitted data. Columns: S.NO, District, Station Name, Station ID, Rainfall (mm), Status ("Updated").

**Not Updated Stations Table:** Lists stations with no valid data. The Rainfall column is an **editable text field** with validation (accepts numeric values up to 400 mm, one decimal place). When the user edits a value and moves focus away, `updateRainfallValueData()` is triggered automatically, saving the change via the API. Status shows "Not Updated".

**Verified Stations Table:** Lists stations that have been verified. Columns: S.NO, District, Station Name, Station ID, Rainfall (mm), Verified DateTime (formatted from `verified_at` timestamp), Status ("Verified").

**Not Verified Stations Table:** Lists updated but unverified stations. The Status column is colour-coded red for "Not Verified". Each row has a **selection checkbox** for bulk operations.

**Figure 28: iRAINS Verification MC – Station Verification Status Panel**
> *[Insert screenshot here]*

**Verification Actions**

From the Not Verified Stations table, the MC user can perform two verification actions:

- **VERIFY SELECTED:** Checks the selection array and calls the verification API for only the checked station IDs on the selected date.
- **VERIFY ALL:** Calls the verification API for every station currently displayed in the Not Verified table, regardless of checkbox state.

Both actions present a confirmation dialog before proceeding: "Do you want to verify the selected/all stations?" On confirmation, the API sets `is_verified = 1`, `verified_at = NOW()`, and `verified_by = userId` for all specified stations. The component then reloads the full dataset to refresh all counters and tables.

After verification, an alert message confirms: "Selected stations verified successfully" or "All stations verified successfully."

**Data Integration**

The Verification MC section uses the same `fetchStationData` API endpoint as the Verification HQ section, but applies MC/RMC-level filtering on the frontend. The API returns all stations in the system for the selected date; the Angular component filters this response to retain only stations whose `centre_type` and `centre_name` match the logged-in user's stored centre identity. This filtering approach ensures that the same backend query serves both HQ (national scope) and MC (centre scope) views without requiring separate endpoints.

Rainfall value updates for "Not Updated" stations use the same `updateStationData` endpoint as the Data Entry section, with the same upsert logic in `station_daily_data_updates`. Verification actions use `verifyMultipleStationData`, which updates the verification fields in the same table.

**Threshold Computation and Logic**

The same four status definitions from the Verification HQ section apply here at the individual MC/RMC scope:

| Status | Definition |
|---|---|
| Updated | Rainfall value ≠ −999.9 for the date |
| Not Updated | Rainfall value = −999.9 or no record exists |
| Verified | `is_verified = 1` AND valid rainfall value |
| Not Verified | `is_verified = 0` AND valid rainfall value |

The maximum editable rainfall value in the Not Updated table is **400 mm**, which is a higher operational limit than the 100 mm limit in the main Data Entry section, to accommodate extreme rainfall observations at high-rainfall stations in the Western Ghats, North-East India, and other high-rainfall zones.

**Back-End Architecture**

The Verification MC section reuses backend infrastructure from both the Data Entry and Verification HQ sections. Data retrieval is via `StationDataUpdates.js → fetchStationData`; verification is via `StationDataUpdates.js → verifyMultipleStationData`; rainfall edits are via `StationDataUpdates.js → updateStationData`. The centre-level scoping is applied on the frontend, keeping the backend stateless with respect to user role — all role-based access control is enforced through session context and JWT authentication at the middleware layer, which prevents MC users from submitting requests that reference stations outside their assigned centre.

**Programming Environment**

The Verification MC component is built with **Angular 16**. It uses the same Angular service layer (`VerificationService`) as the Verification HQ component for API calls. The backend is **Node.js + Express** with **pg** for PostgreSQL queries.

**API Generation**

| Method | Endpoint | Purpose | Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchStationData | Fetch all stations for date (filtered on frontend) | { Date: "YYYY-MM-DD" } |
| POST | /api/v1/verifyMultipleStationData | Verify one or more stations | { date, station_ids: [], userid } |
| POST | /api/v1/updateStationData | Save a missing rainfall value | { station_code, date, value } |

**User Role and Management**

<a id="table-22"></a>

**Table 22: Verification MC – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View own-centre summary counter panel | No (uses Verification HQ) | Yes | No |
| View Updated Stations drill-down | No | Yes | No |
| Edit missing values in Not Updated drill-down | No | Yes | No |
| View Verified Stations with timestamps | No | Yes | No |
| View Not Verified Stations with checkboxes | No | Yes | No |
| Verify selected stations | No | Yes | No |
| Verify all not-verified stations | No | Yes | No |

---

**Verification MC — Counter Panel Definitions**

The four summary counter cards at the top of the Verification MC section each represent a specific aspect of the daily data submission and verification lifecycle for the MC's own station network:

| Counter | Definition | How to Interpret |
|---|---|---|
| **Updated** | Number of active stations assigned to this centre for which a rainfall value has been saved for today (any value, including −999.9). | This should approach the total number of active stations by mid-morning. Low Updated count indicates incomplete data entry. |
| **Pending** | Number of active stations with no submitted data for today. | Pending = Total Active Stations − Updated. This should reach zero after all data entry is complete. |
| **Verified** | Number of stations whose submitted data has been formally verified by an HQ user. | Verification is performed by HQ, not MC. This counter grows as HQ works through the verification cycle. |
| **Not Verified** | Number of stations with submitted data that has not yet been verified. | This is the "queue" of data awaiting HQ review. Ideally reaches zero by end of the working day. |

**Important:** The Verified + Not Verified count may differ from the Updated count if some data was entered after HQ began verification (newly entered data automatically requires re-verification).

---

**Verification MC — Drill-Down Views Explanation**

The Verification MC section provides four drill-down tabs, each showing a filtered subset of the centre's station list:

| Tab | Shows | Primary Use |
|---|---|---|
| **Updated** | All stations with a submitted value for today, with the submitted value visible | Spot-check that submitted values look reasonable before HQ reviews them |
| **Not Updated** | All stations with no data submitted for today, with an editable entry field | Quickly identify and enter missing observations without returning to Data Entry |
| **Verified** | All stations confirmed verified by HQ, with verification timestamp | Confirm which stations have passed HQ review; reference for follow-up if HQ has questions |
| **Not Verified** | All stations submitted but not yet verified, with a Verify checkbox and button | MC users can pre-flag stations they believe should be prioritised for HQ verification |

The Not Updated drill-down provides the same inline data entry capability as the main Data Entry section — MC users can enter missing values directly from this view without navigating away, which is useful during the morning verification cycle when the MC supervisor is reviewing the completeness dashboard.

---

**Verification MC — Escalation to HQ**

If the MC operator notices data quality issues that cannot be resolved at the centre level, the following escalation procedure applies:

1. **Unusual value at one station:** The MC operator reviews the station's recent history using the Station Statistics section. If the value appears to be an entry error (e.g., 120 mm recorded when all surrounding stations show 0 mm), the correct value should be re-entered. If the original reading is genuinely from the gauge, the value stands and should be noted in the centre's records.

2. **Station not receiving any data:** If a station consistently shows as Not Updated across multiple days, the MC operator should check whether the station is still active (equipment functioning, observer present). If the station is temporarily offline, this should be reported to HQ so the station can be flagged in the calculation_exclusions table to prevent its absence from skewing district aggregations.

3. **Disputed verification:** If HQ holds a station in Not Verified status without explanation, the MC operator should contact the HQ verification officer directly. Common reasons for held verifications include: the value appears inconsistent with neighbouring stations, the reading is above the 100mm validation warning threshold, or the station's history suggests instrument issues.

---

## *Station Statistics* 

> **Purpose**

The Station Statistics module is designed to provide detailed
station-level rainfall analysis through an interactive geospatial
interface. This section enables users to monitor, analyse, and compare
rainfall observations from individual stations across different regions
of India in near real time. By integrating map-based visualisation,
temporal rainfall trends, spatial comparison tools, and advanced
filtering options, the module supports operational meteorological
analysis, quality assessment, and decision-making activities within the
Hydromet Division.

The module allows users to:

-   Visualise rainfall stations dynamically on an interactive map.

-   Analyse station-specific rainfall observations and normal values.

-   Monitor 30-day rainfall trends through graphical representations.

-   Compare rainfall behaviour between neighbouring stations within a
    > configurable radius.

-   Filter stations using administrative hierarchy, station type, and
    > rainfall intensity categories.

-   Identify significant rainfall patterns and spatial variability
    > across selected regions.

-   Perform custom area-based analysis using polygon selection tools.

-   Export maps and charts for reporting, operational use, and
    > documentation purposes.

This section serves as an important analytical component of iRAINS by
supporting detailed rainfall monitoring, station validation, comparative
assessment, and localized hydrometeorological analysis.

**Features**

- Presents a full-India interactive Leaflet satellite map overlaid with circle markers for every active rainfall observation station, colour-coded in real time according to the IMD rainfall intensity category for the selected date or date range.
- Supports a **hierarchical administrative filter panel** with six cascading multi-select controls (Region, MC, RMC, State, District, Station) and additional station-type checkboxes (AWS, ORG, ARG) and rainfall-category checkboxes for targeted display.
- Opens a detailed station information panel on marker click, showing total days with data, total days missing, the all-time highest recorded rainfall with the corresponding date, the station's activation date, and a 30-day daily rainfall trend chart (Highcharts line chart).
- Provides a **Nearby Stations Comparison** tool: a radius slider (1–500 km, default 50 km) draws a radius circle on the map and populates a station list, from which the user selects stations to compare in a multi-line Highcharts chart showing individual station daily rainfall over 30 days.
- Includes a **Polygon Selection Tool** (leaflet-draw) allowing users to draw a freehand polygon directly on the map; all stations within the polygon boundary are automatically identified using geometric intersection (Turf.js) and listed in a selectable table.
- Exports charts and map views in four formats — PNG, JPEG, PDF, SVG — via Highcharts' built-in exporting module.
- Displays a **Top N Stations** ranking table (configurable, default top 5, up to 50) listing the stations with the highest rainfall for the selected date range, with station name, state, district, subdivision, and rainfall value.

**Sub-Modules**

**Administrative Filter Panel**

The left sidebar of the Station Statistics section hosts a comprehensive filter panel that enables users to scope the map and data to any combination of geographic and station-type criteria. The panel contains the following controls, implemented with PrimeNG multi-select dropdowns:

- **Region** — Multi-select dropdown listing all IMD regions. Selecting a region cascades to populate the MC and RMC dropdowns with centres belonging to the selected region(s).
- **MC** — Multi-select dropdown for Meteorological Centres filtered by the selected region(s).
- **RMC** — Multi-select dropdown for Regional Meteorological Centres, also filtered by region.
- **State** — Multi-select dropdown showing states under the selected MC(s) or RMC(s).
- **District** — Multi-select dropdown filtered by selected state(s).
- **Station** — Multi-select dropdown filtered by selected district(s), enabling selection of individual stations.

Below the geographic filters, three **Station Type** checkboxes (AWS, ORG, ARG) allow filtering by instrumentation type, and seven **Rainfall Category** checkboxes (Zero Rainfall, Very Light, Light, Moderate, Heavy, Very Heavy, Extremely Heavy) allow filtering the map markers by the intensity of rainfall recorded on the selected date.

**Interactive Satellite Map**

The central element of the Station Statistics section is a full-screen Leaflet map initialized at the geographic centre of India (approximately 23° N, 90° E) at zoom level 5.2. The satellite base layer is sourced from the ArcGIS World Imagery tile service, providing high-resolution imagery of terrain and land cover. The map is overlaid with:

- **State boundary lines** in white, derived from a GeoJSON file of India's state borders.
- **India boundary mask** that darkens the area outside India for visual clarity.
- **Station circle markers**, one per active station, positioned at the station's geographic coordinates. Each marker is filled with a colour corresponding to the station's current rainfall intensity category (see Threshold Computation section). Hovering over a marker displays a brief popup with the station name and rainfall value. Clicking a marker opens a detailed station card.

**Figure 29: iRAINS Station Statistics – Interactive Map with Station Markers**
> *[Insert screenshot here]*

**Station Detail Panel**

Clicking a station marker opens a popup card with two action buttons: **More Info** and **Compare**.

Clicking **More Info** expands a detail panel below the map showing:
- Station Name, State, and District.
- **No. of Days Data Received** — the number of days in the system's history for which a valid (non-sentinel) rainfall value exists for this station.
- **No. of Days Data Missing** — the count of dates with a −999.9 sentinel or no record.
- **Highest Rainfall Record** — the maximum daily rainfall ever recorded at this station, with the date of that record.
- **Station Activation Date** — the date the station was commissioned.
- A **30-day rainfall trend chart** (Highcharts line chart) showing the daily rainfall in millimetres for the 30 days preceding the selected date. Dates with no data are shown as zero. The chart supports export in PNG, JPEG, PDF, and SVG formats, as well as full-screen view.

**Figure 30: iRAINS Station Statistics – 30-Day Trend Graph**
> *[Insert screenshot here]*

**Nearby Stations Comparison Tool**

Clicking the **Compare** button in the station marker popup activates the Nearby Stations Comparison tool. A **radius slider** in the bottom-left of the interface (labelled "Selected Radius: [value] Kilometres", range 1–500 km, default 50 km) draws a circle of the selected radius on the map centred on the clicked station. All stations within this circle are listed in a comparison table.

Each row in the comparison table has a selection checkbox. The user selects the stations they wish to compare and clicks **Update Chart** to generate a multi-series Highcharts line chart. Each selected station appears as one line series on the chart, with dates on the X-axis and rainfall in mm on the Y-axis. A legend identifies each station by name. This view allows direct visual comparison of rainfall patterns at nearby stations over a 30-day window, helping to identify spatial rainfall gradients and station reporting anomalies.

**Figure 31: iRAINS Station Statistics – Nearby Station Comparison View**
> *[Insert screenshot here]*

**Polygon Area Selection Tool**

The **Plot Area** button (top-left of the map) activates the Polygon Drawing mode, powered by the **leaflet-draw** library. In this mode, the user clicks on the map to define the vertices of a polygon and closes the polygon by clicking the starting point. Once the polygon is drawn, the system uses the **Turf.js** geospatial library to identify all stations whose latitude and longitude coordinates fall within the polygon boundary (`turf.booleanPointInPolygon`). The matched stations are listed in a table showing station name, state, rainfall value, and station code. Rows can be individually selected via checkboxes for focused analysis. This tool is particularly useful for defining custom catchment areas, river basin boundaries, or administrative sub-regions that do not correspond to standard IMD geographic units.

**Top N Stations Ranking Table**

A configurable ranking table lists the stations with the highest rainfall for the selected date range. The default displays the top 5 stations, with the limit adjustable up to 50. Each row shows: Station Name, State, District, Meteorological Subdivision, and Rainfall value in mm. This table provides a rapid overview of extreme rainfall events and high-impact stations without manual inspection of the full map.

**Data Integration**

The Station Statistics section retrieves data through multiple backend endpoints that together serve the different analytical modes. For the initial map load, `fetchStationDataTemp` returns all active stations with their rainfall value for the selected single date or `fetchInRangeStationdata` returns summed rainfall for a date range. Station geographic metadata (latitude, longitude, district, subdivision) is sourced from `station_details` joined with `normal_district_details`.

For the 30-day trend chart and the nearby station comparison charts, `fetchAllDatesAndDataOfStation` retrieves the full historical record of a specific station, which the frontend then filters to the most recent 30 days. For the radius-based nearby station lookup, `fetchStationDataInRadius` uses a server-side Haversine distance calculation to return only stations within the specified distance from the queried coordinates. The Top N stations ranking is served by `fetchStationWithMaxRainfall`, which performs a database-side aggregation and returns the top N records sorted by total rainfall.

**Threshold Computation and Logic**

Station markers on the map are colour-coded using the standard IMD rainfall intensity classification:

<a id="table-23"></a>

**Table 23: Station Statistics – Rainfall Intensity Classification**

| Category | Rainfall Range (Daily) | Marker Icon |
|---|---|---|
| Zero Rainfall | 0 mm (exactly) | Grey marker |
| Very Light Rainfall | 0.1 mm to 2.4 mm | Light yellow marker |
| Light Rainfall | 2.5 mm to 15.5 mm | Light green marker |
| Moderate Rainfall | 15.6 mm to 64.4 mm | Green marker |
| Heavy Rainfall | 64.5 mm to 115.5 mm | Orange marker |
| Very Heavy Rainfall | 115.6 mm to 204.4 mm | Red marker |
| Extremely Heavy Rainfall | Above 204.4 mm | Dark red / maroon marker |

Stations with a value of −999.9 (No Data) are rendered with a neutral marker and excluded from the rainfall category filters.

**Back-End Architecture**

The backend for Station Statistics is implemented primarily in `Station.js`. The `fetchStationDataTemp` function queries `station_daily_data_updates` joined with `station_details` and `normal_district_details` for a given date, returning all stations with their data values and geographic metadata. The `fetchStationDataInRadius` function performs a Haversine distance calculation in the SQL query — computing the great-circle distance between the queried coordinates and each station's latitude/longitude — and returns only stations within the specified radius in kilometres.

The `fetchAllDatesAndDataOfStation` function retrieves the complete time series for a station from `station_daily_data_updates`, ordered by `collection_date`. This function is called once when a user opens the detail panel for a station, and the resulting array is filtered on the frontend to the 30-day window. The `fetchStationWithMaxRainfall` function performs a `SUM(data)` grouped by station over the specified date range, filtered to exclude −999.9 values, and orders by total rainfall descending with a LIMIT clause for the top N ranking.

**Programming Environment**

The Station Statistics frontend component is built with **Angular 16** and uses **PrimeNG** multi-select components for the administrative filter panel. The map is rendered with **Leaflet.js** using a satellite tile layer from ArcGIS. Polygon drawing uses the **leaflet-draw** plugin, and polygon intersection is computed with the **@turf/turf** geospatial library. All charts (trend, comparison) use **Angular-Highcharts**. Map and chart export uses Highcharts' built-in `exporting` and `full-screen` modules. The backend is **Node.js + Express** with **pg** for PostgreSQL queries.

**API Generation**

| Method | Endpoint | Purpose | Key Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchStationDataTemp | Fetch all stations with rainfall for one date | { date: "YYYY-MM-DD" } |
| POST | /api/v1/fetchInRangeStationdata | Fetch summed station rainfall for a date range | { fromDate, toDate } |
| POST | /api/v1/fetchStationDataInRadius | Fetch stations within radius using Haversine | { Date, lat, long, range } |
| POST | /api/v1/fetchAllDatesAndDataOfStation | Fetch full rainfall history for one station | { station_id } |
| POST | /api/v1/fetchStationWithMaxRainfall | Fetch top N stations by rainfall in period | { startDate, endDate, limit } |

**User Role and Management**

<a id="table-24"></a>

**Table 24: Station Statistics – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View interactive satellite map with station markers | Yes | Yes | Yes |
| Apply administrative filters (Region → Station) | Yes | Yes (own centre) | Limited |
| Filter by station type (AWS / ORG / ARG) | Yes | Yes | Yes |
| Filter by rainfall intensity category | Yes | Yes | Yes |
| Click station marker to view detail panel | Yes | Yes | Yes |
| View 30-day trend chart for a station | Yes | Yes | Yes |
| Use nearby stations radius comparison tool | Yes | Yes | Yes |
| Draw polygon and identify stations within area | Yes | Yes | Yes |
| View Top N stations ranking table | Yes | Yes | Yes |
| Export charts as PNG, JPEG, PDF, or SVG | Yes | Yes | No |

---

**Station Statistics — Map Marker Colour Reference**

Station markers on the Station Statistics interactive map are colour-coded by the selected date's rainfall intensity, enabling rapid visual identification of stations experiencing heavy, moderate, or negligible rainfall. The colour coding follows IMD's seven-category intensity classification:

| Marker Colour | Category | Daily Rainfall (mm) |
|---|---|---|
| Grey | Zero Rainfall | 0 mm |
| Light Yellow | Very Light | 0.1 to 2.4 mm |
| Light Green | Light | 2.5 to 15.5 mm |
| Green | Moderate | 15.6 to 64.4 mm |
| Orange | Heavy | 64.5 to 115.5 mm |
| Red | Very Heavy | 115.6 to 204.4 mm |
| Dark Red / Maroon | Extremely Heavy | Above 204.4 mm |
| Light Grey (hollow) | No Data | −999.9 (ND) |

On the map, stations with zero rainfall are shown in grey and may be toggled off using the intensity filter to reduce clutter during periods when most of the country is dry. During an active monsoon day, the concentration of orange and red markers provides an immediate visual indication of heavy-rain zones without requiring any textual labels.

---

**Station Statistics — Nearby Station Comparison: Interpretation Guide**

The Nearby Station Comparison tool returns all active stations within the user-defined radius. The resulting comparison table should be interpreted as follows:

- **Distance column:** The great-circle distance computed using the Haversine formula. For flat terrain, this approximates the straight-line ground distance. For mountainous areas, the actual travel distance is much greater, and nearby stations may experience very different rainfall regimes due to orographic effects.
- **Station-to-station rainfall variability:** In flat, homogeneous terrain (e.g., Gangetic plains), nearby stations should show similar rainfall values during widespread monsoon rain. High variability (one station recording 80 mm while an adjacent station records 5 mm) may indicate a convective thunderstorm with a very small footprint, or it may indicate an entry error at one of the stations.
- **Orographic contrast:** In mountainous regions (Western Ghats, Eastern Ghats, Himalayan foothills), rainfall can vary dramatically over short distances. A station on the windward slope may record 200+ mm while a station in the rain shadow 30 km away records 2 mm. This is physically expected and should not be interpreted as a data error.

---

**Station Statistics — Polygon Area Selection Technical Reference**

The polygon selection tool is implemented using the `leaflet-draw` plugin for polygon drawing and the `@turf/turf` library for the geospatial point-in-polygon test.

**How the polygon selection works:**

1. The user clicks the Polygon tool icon in the Leaflet draw controls (typically a pentagon icon in the map toolbar).
2. The user clicks successive points on the map to define the polygon vertices. Clicking the first point again closes the polygon.
3. The `leaflet-draw:created` event fires, delivering the polygon's GeoJSON geometry to the Angular component.
4. The component iterates over all loaded station markers. For each station, it extracts the station's latitude and longitude as a GeoJSON Point.
5. Turf.js's `booleanPointInPolygon(point, polygon)` function tests whether each station point lies within the drawn polygon.
6. Stations inside the polygon are extracted as a filtered subset, and the station table and statistics panels are updated to show only these stations.

**Practical uses of polygon selection:**
- Draw a polygon over a specific river catchment to isolate all reporting stations within that catchment.
- Draw a polygon over a region of known heavy rainfall to identify all contributing stations for a localised event analysis.
- Draw a polygon matching a district or tehsil boundary (by tracing its approximate outline) to focus the statistics and trend views on that administrative unit when the standard dropdown filter does not provide sufficient spatial precision.

---

## *Yearly Station Statistics* 

> **Purpose**

The Yearly Station Statistics module is designed to facilitate the
extraction, consolidation, and export of station-level rainfall data
over user-defined time periods. This section enables operational users
to generate structured rainfall datasets for annual, seasonal, monthly,
or custom-period analysis in a single downloadable Excel format.

The module supports advanced filtering based on administrative and
operational hierarchies such as Region, MC, RMC, State, and District,
allowing users to retrieve rainfall records specific to their area of
interest. The generated dataset presents rainfall observations in a
matrix format where each row represents a station and each column
represents a date within the selected period, making it suitable for
large-scale analysis, reporting, verification, and archival purposes.

Key objectives of this section include:

-   Providing centralized access to historical station-level rainfall
    > datasets.

-   Supporting annual and seasonal rainfall reporting workflows.

-   Enabling efficient extraction of rainfall data for statistical
    > analysis and research.

-   Assisting operational users in preparing consolidated rainfall
    > summaries.

-   Simplifying identification of missing observations through
    > standardized no-data indicators.

-   Facilitating offline analysis through downloadable formatted Excel
    > reports.

The Yearly Station Statistics section serves as an important data
management and reporting component within iRAINS by enabling efficient
retrieval, organisation, and dissemination of long-term rainfall records
across India.

**Features**

- Provides access to daily station rainfall data across a user-selected date range in a **Station × Date pivot matrix** format, with fixed identifier columns on the left and dynamic date columns on the right.
- Supports two independent data sources through separate tabs: **IMD** (India Meteorological Department stations, including AWS, ORG, and ARG types) and **State AWS** (State-government-operated Automatic Weather Stations with multiple source agencies).
- Offers a hierarchical multi-select filter for the IMD tab (Region, MC, RMC, State, District) and a single-select filter for the State AWS tab (Source, State, District, Block), with a date range selector for both.
- Provides a **Statistics** view accessible after loading data, presenting a split-panel interface with a Leaflet satellite map (station markers colour-coded by rainfall intensity) and up to five analytical charts built with Angular-Highcharts.
- Generates a styled, multi-section Excel workbook with filter summary, important data notes, and a styled data table where missing values (−999.9) are highlighted in red, suitable for formal reporting and data archiving.
- Restricts Region, MC, and RMC filter controls for MC/RMC users, showing only their assigned centre rather than the full national list.

**Sub-Modules**

**IMD Tab**

The IMD tab is the primary data access interface for India Meteorological Department station data. It presents multi-select filter controls for narrowing the station list and then displays the resulting data in a pivot table format.

**IMD Filter Panel:**

- **Select Regions** (visible to HQ and SP users only; MC/RMC users see their assigned region name as a read-only label)
- **Select MCs** (visible to HQ/SP only; MC/RMC users see their centre name as a label)
- **Select RMCs** (visible to HQ/SP only)
- **Select States** (visible to all users; options filtered by selected MC/RMC)
- **Select Districts** (visible to all users; options filtered by selected states)
- **From Date** and **To Date** date range inputs (default to current date on load)

After setting filters, the user clicks **Submit** to fetch data. For MC and RMC users, the system pre-populates the centre filter with the logged-in user's assignment and returns only the stations under that centre.

**IMD Data Table:**

The resulting table is a pivot matrix with the following structure:

- **Fixed Left Columns:** State Name, District Name, Block Name, Block Code, Station Name, Station ID, Latitude, Longitude.
- **Dynamic Date Columns:** One column per date in the selected range. Column headers display the date.
- **Data Cells:** The recorded rainfall value (mm) for that station on that date. Missing values are displayed as "−".

**State AWS Tab**

The State AWS tab provides access to rainfall data from Automatic Weather Stations operated by state government agencies, which are separate from the IMD network. The filter controls in this tab use single-select dropdowns (not multi-select), reflecting the hierarchical structure of AWS data:

- **Source** — Single-select dropdown listing all AWS source agencies available in the dataset.
- **State** — Single-select dropdown for the state, filtered by the selected source.
- **District** — Single-select dropdown, filtered by state.
- **Block** — Single-select dropdown, filtered by district.
- **From Date** and **To Date** date inputs.

After submission, the AWS data is returned as a flat dataset and pivoted into the same Station × Date matrix format as the IMD tab. AWS rows include an additional **Source** column in the fixed left columns. Rows are sorted by source data availability (descending).

**Figure 32: iRAINS Yearly Station Statistics – Station × Date Matrix Export**
> *[Insert screenshot here]*

**Statistics Panel**

After data is loaded for either tab, a **Statistics** button (with a chart icon) appears in the toolbar. Clicking it opens a split-panel view:

- **Left Panel (40% width):** A Leaflet satellite map with circle markers at each station's geographic coordinates. Markers are colour-coded by rainfall intensity category for the latest date in the selected range. Hovering over a marker shows a popup with the station name, state, district, and rainfall value.

- **Right Panel (60% width):** A 2×2 grid (IMD) or 2×3 grid (AWS) of Highcharts analytical charts.

**IMD Statistics Charts (4 Charts):**

1. **Rainfall Received Pie Chart** — Shows the distribution of stations across the seven IMD intensity categories (Zero, Very Light, Light, Moderate, Heavy, Very Heavy, Extremely Heavy) for the latest date, as a count-based pie chart with intensity-specific colours.

2. **Data Availability Donut Chart** — A donut chart with three slices showing the count of station–date combinations that have valid data (green), have a −999.9 No Data sentinel (red), and have no record at all (grey — "Not Entered"). This gives a quick assessment of reporting completeness across the selected stations and dates.

3. **Top 10 Stations Bar Chart** — A horizontal bar chart listing the 10 stations with the highest total rainfall across the selected date range. Each bar displays the station name and total rainfall in mm. Data labels are shown on bars.

4. **State-wise Average Column Chart** — A column chart with one bar per state (X-axis labels rotated −45°) showing the average rainfall across all stations in that state for the selected date range. Only stations with valid (non-−999.9) values are included in the average.

**State AWS Statistics Charts (5 Charts):**

The first four charts are identical to the IMD charts. An additional fifth chart is present:

5. **Station Count by Source Pie Chart** — A pie chart showing how many stations are in the dataset from each AWS source agency. This chart helps users understand the relative representation of different data providers in the AWS dataset.

**Excel Download**

The **Download** button generates a styled `.xlsx` file with the following structure:

- **Row 1:** Document title — "IMD Rainfall Information System - Daily Station Data" — in large bold italic blue text on a dark blue background.
- **Rows 2–10:** A metadata block containing filter summary (applied Region, MC, RMC, States, Districts), date range, generation timestamp, and important data notes ("All values in mm", "−999.9 = no data", "Source: India Meteorological Department").
- **Row 12 onwards:** The data table with a styled blue header row and alternating white/light-grey row striping. Cells containing −999.9 values are highlighted with red text on a light red background. Column widths are auto-calculated between 15 and 30 characters.

The IMD filename format is `IMD_Station_Data_[Region]_[FromDate]_to_[ToDate].xlsx` and the State AWS filename is `IMD_StateAWS_[FromDate]_to_[ToDate].xlsx`.

**Data Integration**

The IMD tab fetches data via `fetchFilteredStationUnifiedFileFTP`, which queries `station_daily_data_updates` filtered by a list of district codes derived from the cascading filter selections. The query returns individual date–station rainfall rows, which the frontend assembles into the pivot matrix using the `groupByDates` function. The State AWS tab fetches data via `fetchStateAwsUnifiedFile`, which queries an AWS-specific data table and returns a pre-pivoted response. Both responses are held in memory for client-side filter refinement (State AWS tab only — the AWS Source/State/District/Block filters apply to the returned dataset without triggering additional API calls).

Normal rainfall values are not used in the Yearly Station Statistics section — the module is a raw data explorer presenting observed values without departure or classification. Aggregations for the Statistics charts are computed entirely on the frontend from the loaded dataset.

**Threshold Computation and Logic**

The Yearly Station Statistics section does not apply departure classification thresholds. The only categorical logic applied is the rainfall intensity classification used for the Statistics map markers and the Rainfall Received Pie Chart, which uses the same seven IMD intensity categories described in the Station Statistics section (Table 23).

For the Data Availability Donut Chart, three categories are derived from the data state:
- **Has Data:** Station–date combinations where the value is ≠ −999.9.
- **No Data (−999.9):** Station–date combinations where the value equals −999.9.
- **Not Entered:** Station–date combinations where no record exists in the database at all.

**Back-End Architecture**

The backend for the IMD tab is handled by `fetchFilteredStationUnifiedFileFTP` in `Station.js`. This function accepts a list of district codes and a date range, and executes a PostgreSQL query joining `station_daily_data_updates`, `station_details`, and `normal_district_details` to return all station–date rainfall records for the specified geography and period. The function returns a flat array of records with one row per station per date.

The State AWS backend `fetchStateAwsUnifiedFile` queries an AWS-specific table (separate from the standard IMD `station_daily_data_updates`) and returns data for all AWS stations in the system for the requested date range. The AWS data typically includes source agency metadata alongside the rainfall values.

On the frontend, the `groupByDates` function transforms the flat array into a nested object keyed by station identity, with each inner object keyed by date — effectively constructing the pivot table in memory. This transformation runs in a single pass over the data and is efficient for typical ranges of up to a few months.

**Programming Environment**

The Yearly Station Statistics frontend component is built with **Angular 16** and **PrimeNG** multi-select components (IMD tab). The Statistics charts use **Angular-Highcharts**. The Statistics map uses **Leaflet.js** with an ArcGIS satellite tile layer. Excel generation uses the **xlsx-js-style** library (an extended version of SheetJS that supports cell-level styling). The backend is **Node.js + Express** with **pg** for PostgreSQL queries.

**API Generation**

| Method | Endpoint | Purpose | Key Request Fields |
|---|---|---|---|
| POST | /api/v1/fetchFilteredStationUnifiedFileFTP | Fetch IMD daily data by district list and date range | { fromDate, toDate, districtCodeList: [] } |
| POST | /api/v1/fetchStateAwsUnifiedFile | Fetch State AWS daily data for date range | { startDate, endDate } |
| POST | /api/v1/fetchInRangeStationdata | Fetch summed station data for date range | { fromDate, toDate } |

**User Role and Management**

<a id="table-25"></a>

**Table 25: Yearly Station Statistics – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View IMD station data in pivot table format | Yes | Yes (own centre only) | No |
| Apply multi-select Region / MC / RMC filters | Yes | No (centre shown as label) | No |
| View State AWS data in pivot table format | Yes | Yes | No |
| Apply Source / State / District / Block filters | Yes | Yes | No |
| View Statistics split-panel (map + charts) | Yes | Yes | No |
| Download IMD Excel (.xlsx) with styled formatting | Yes | Yes | No |
| Download State AWS Excel (.xlsx) | Yes | Yes | No |

---

**Yearly Station Statistics — Excel Output Format Reference**

The exported Excel file from the Yearly Station Statistics section is formatted as a station × date matrix. The following specifications describe the exact structure of the output for operators who need to post-process the file in statistical analysis tools:

**File: IMD Station Export**

| Section | Description |
|---|---|
| Filename | `iRAINS_Station_Statistics_[Region/MC]_[DateRange].xlsx` |
| Sheet name | `Station Data` |
| Row 1 | Report title (e.g., "IMD Station Daily Rainfall — Maharashtra — Jun–Sep 2024") |
| Row 2 | Generation timestamp |
| Row 3 | Date range covered |
| Row 4 | Column headers — Station Code, Station Name, State, District, Subdivision, then one column per date in DD-MMM-YYYY format |
| Row 5 onward | One row per station |
| Rainfall cells | Numeric mm values to one decimal place; "ND" for no-data (−999.9 stored value) |
| Total rows | Number of active stations in the filtered selection |
| Total columns | 5 metadata columns + number of days in the date range |

**File: State AWS Export**

The State AWS export follows the same structure but draws from automatic weather station data specifically and may include additional columns for AWS-specific parameters (temperature, humidity) if those are available in the system configuration.

---

**Yearly Station Statistics — Common Analysis Workflows Using the Export**

**Annual Archive Preparation**

At the end of each calendar year, the HQ data manager selects the full year date range (Jan 1 to Dec 31) and exports the full national station dataset in segments (by region or MC, to manage file size). The resulting Excel files are the basis for IMD's annual rainfall data compilation and are submitted to the National Data Centre.

**Monsoon Season Analysis**

Climate scientists use the monsoon season export (Jun 1 – Sep 30) as their primary dataset for computing:
- Station-level seasonal total (sum of non-ND values for each station's row)
- Number of rain-days per station (count of values ≥ 2.5 mm)
- Number of heavy-rain days per station (count of values ≥ 64.5 mm)
- Onset date for each station (first date with ≥ 2.5 mm after a specified pre-monsoon dry period)
- Withdrawal date (last date with ≥ 2.5 mm followed by a specified dry period)

These derived statistics are computed externally in R or Python after importing the Excel export, as iRAINS itself does not compute derived annual or seasonal station-level statistics.

**Missing Data Assessment**

The frequency and pattern of "ND" cells in the export reveals data quality and submission issues at the station level. A station with:
- Isolated ND cells: Short-term instrument or transmission issues; normal operational gaps.
- Consecutive ND cells for 1–2 weeks: Station may have been temporarily decommissioned or experiencing equipment failure. Should be investigated.
- ND cells every weekend: May indicate an observer who does not report on rest days (relevant for ORG stations).
- All ND cells: Station may be inactive or incorrectly assigned. Verify station status in the station_details registry.

---

## *Log Info* 

> **Purpose**

The Log Info module serves as the centralized audit and activity
tracking system within iRAINS. It is designed to maintain a transparent
and traceable record of important system operations, user activities,
and data management actions performed across the platform. By providing
detailed logs of station modifications, report generation activities,
and operational user actions, this module supports system monitoring,
accountability, troubleshooting, and administrative oversight.

The section enables HQ and MC administrators to:

-   Monitor changes made to the station database, including additions,
    > edits, and deletions.

-   Track report generation and download activities across the system.

-   Review user actions such as login, data submission, and verification
    > operations.

-   Identify when specific activities occurred and which user performed
    > them.

-   Support operational auditing, system validation, and historical
    > activity review.

-   Improve data integrity, transparency, and accountability within the
    > rainfall management workflow.

The Log Info section acts as an essential administrative and governance
component of iRAINS by ensuring that all critical system activities are
properly recorded and available for review whenever required.

**Features**

- Provides three independent audit log views — **Station Log**, **Reports Log**, and **Action Log** — each recording a different category of system activity with dedicated table layouts and filtering capabilities.
- The Station Log records all station additions and deletions performed by HQ administrators, providing a permanent record of changes to the station registry.
- The Reports Log captures all report upload events, recording the report name, the uploading user, and the upload timestamp.
- The Action Log records user actions performed by officers on a date-specific basis, with a date selector enabling review of all system activities on any given day.
- Restricts access to authorized administrative users (HQ and MC), ensuring that sensitive audit records are not visible to general users or guests.

**Sub-Modules**

**Station Log**

The Station Log provides a chronological record of every station addition and deletion performed in the iRAINS system. Each time an HQ administrator adds a new station or deletes an existing one via the Station Management sub-module in Data Entry, a corresponding entry is written to the `station_logs` database table.

The Station Log table displays the following columns:

- **Station ID** — The unique numeric station code of the affected station.
- **District** — The administrative district name associated with the station.
- **Station** — The official name of the station.
- **Date Time** — The timestamp when the change was made, formatted as DD-MM-YYYY HH:MM:SS.
- **Added / Deleted** — The log type, showing either "Added" (new station created) or "Deleted" (station removed from registry).

The Station Log displays the most recent 50 records by default and does not include user-facing pagination or date filters. The list is loaded automatically when the Log Info section is opened and reflects the current state of the station registry change history.

**Reports Log**

The Reports Log provides visibility into PDF and document upload activities within iRAINS. Whenever a document or report is uploaded into the system (for example, a QPF Verification Report PDF), the upload event is recorded as a log entry.

The Reports Log table columns are:

- **Report Name** — The name of the uploaded report or document.
- **User** — The username of the officer who performed the upload.
- **Date Time** — The timestamp of the upload, formatted as DD-MM-YYYY HH:MM:SS.
- **Uploaded** — A static label confirming the event type as "Report Uploaded".

This log is filtered from a broader activity log table, showing only entries where the event type matches "Report Uploaded". It serves as a traceability record for document management within iRAINS.

**Action Log**

The Action Log records user actions and system operations performed by officers on a selected date. Unlike the Station Log and Reports Log (which are always shown as a flat list), the Action Log is date-specific and includes a **Date Selector** (labelled with a calendar input, maximum value set to today) and a **Submit** button. On load, the log for the current date is displayed automatically. Users can navigate to any historical date using the date picker.

The Action Log table columns are:

- **Officer Name** — The full name of the officer who performed the action.
- **Logged In as** — The system username under which the action was performed.
- **Time** — The time of the action, formatted in 12-hour format (HH:MM AM/PM).
- **Action** — A text description of the action performed (for example, data entry, verification, station management, or PDF generation).

The Action Log supports date-based filtering only; there is no filter by user or action type. Records are retrieved for the full selected day.

**Figure 33: iRAINS Log Info – Station Change Log**
> *[Insert screenshot here]*

**Data Integration**

The three log sub-sections draw from three separate database tables. The **Station Log** queries the `station_logs` table, which stores `station_code`, `station_name`, `district_code`, `log_date`, `userid`, and `log_type`. The query joins this table with `station_details` and `normal_district_details` to resolve station and district names. The **Reports Log** reads from the `deletedstationlog` table (which serves a dual purpose as a general activity log) and filters records where `type = 'Report Uploaded'`, returning the `stationname` (report name), `username`, and `datetime` fields. The **Action Log** reads from the `data_actions` table, filtering by `updated_at::date = $1` for the selected date, and returns `employee_name`, `loggedin_user`, `action`, and `updated_at` fields.

**Threshold Computation and Logic**

The Log Info section performs no meteorological computations. All logic is limited to chronological filtering (by date in the Action Log) and event-type filtering (by `type` field in the Reports Log). No departure thresholds or rainfall classification criteria are applied.

**Back-End Architecture**

The Station Log is served by `Station.js → fetchStationLogs`, which executes a SELECT query on `station_logs` joined with `station_details` and `normal_district_details`, ordered by `log_date` descending with a LIMIT of 50. The Reports Log endpoint reads from `deletedstationlog` ordered by `id` ascending and filters on the frontend. The Action Log is served by `Station.js → dataActions`, which executes a parameterised query filtering `data_actions` by `updated_at::date = $1`, returning all records for the supplied date.

**Programming Environment**

The Log Info frontend components are built with **Angular 16** using standard table components and native date inputs. The backend is **Node.js + Express** with **pg** for PostgreSQL queries.

**API Generation**

| Method | Endpoint | Purpose | Request Fields |
|---|---|---|---|
| GET | /api/v1/fetchStationLogs | Fetch most recent 50 station add/delete events | None |
| GET | /api/v1/deletedstationlog | Fetch all activity log entries | None |
| POST | /api/v1/dataActions | Fetch action log for a specific date | { startDate: "YYYY-MM-DD" } |

**User Role and Management**

<a id="table-26"></a>

**Table 26: Log Info – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | Guest |
|---|---|---|---|
| View Station Log (recent 50 add/delete events) | Yes | Yes | No |
| View Reports Log (document upload history) | Yes | Yes | No |
| View Action Log (daily user actions) | Yes | Yes | No |
| Select date in Action Log | Yes | Yes | No |

---

**Log Info — Log Category Descriptions and Field Reference**

The Log Info section presents audit records from three distinct log categories, each with its own data schema and intended audience.

**Station Log (Add / Edit / Delete Events)**

The Station Log records all changes to the station registry — every time a station is added, edited, or deleted by an HQ administrator.

| Field | Description | Example |
|---|---|---|
| Action Type | The type of change: ADD, EDIT, or DELETE | "ADD" |
| Station Code | The 13-digit station identifier | "0101050012345" |
| Station Name | The official station name | "Nagpur Airport" |
| Changed Fields | For EDIT actions: list of field names that were modified | "latitude, station_type" |
| Previous Values | For EDIT and DELETE: the values before the change | "lat=21.09, type=ORG" |
| New Values | For EDIT: the values after the change | "lat=21.10, type=AWS" |
| Timestamp | Date and time of the action in IST | "2024-06-15 09:23:45" |
| Performed By | Username of the HQ administrator who made the change | "hq_user_01" |

The Station Log shows the most recent 50 events by default. For a full historical audit, the HQ administrator should query the `station_logs` table directly in the database, as the Log Info interface does not currently support pagination beyond the 50-record display limit.

**Reports Log (PDF Upload Events)**

The Reports Log records every time an official report PDF (such as a QPF Verification Report or Rainfall Report PDF) is uploaded to the iRAINS system.

| Field | Description |
|---|---|
| File Name | The uploaded filename |
| Upload Timestamp | Date and time of upload |
| Uploaded By | Username of the user who performed the upload |
| Report Type | Category of the uploaded document (QPF / Rainfall Report / Other) |
| File Size | Size of the uploaded file in kilobytes |

This log enables the HQ administrator to track which documents are available in the system and to identify any incomplete or duplicate uploads.

**Action Log (Daily User Activity)**

The Action Log records individual user actions within iRAINS for any selected date, providing a granular audit trail of system usage.

| Action Type | Description | Logged Fields |
|---|---|---|
| LOGIN | User successfully authenticated | Username, timestamp, IP address |
| DATA_SAVE | Single rainfall value saved | Username, station code, date, value, timestamp |
| BULK_UPLOAD | Excel file processed | Username, date, file name, rows processed, rows failed |
| VERIFY | Station(s) verified | Username, station codes, verification date, timestamp |
| BULK_VERIFY | Multiple stations verified at once | Username, count verified, date, timestamp |
| REPORT_GENERATE | PDF report generated | Username, report type, date range, level |
| EMAIL_SEND | Email dispatched via Dissemination | Username, recipient group, subject, timestamp |
| STATION_ADD | New station added to registry | Username, station code, station name |
| STATION_EDIT | Station metadata edited | Username, station code, changed fields |
| STATION_DELETE | Station removed from registry | Username, station code |
| LOGOUT | User session ended | Username, timestamp |

---

**Log Info — Investigative Use Cases**

**Scenario 1: Identifying who changed a station's coordinates**

The HQ administrator suspects that a station's coordinates were entered incorrectly. To find out when and by whom the change was made:
1. Open Log Info → Station Log
2. Search for the station code in the displayed records
3. Identify the EDIT record that shows the latitude/longitude fields in Changed Fields
4. Note the timestamp and Performed By username

**Scenario 2: Confirming when data entry was completed for a specific centre**

Before generating the daily report, the HQ meteorologist wants to confirm that all MCs have completed data entry. 
1. Open Log Info → Action Log
2. Select today's date
3. Filter by Action Type = DATA_SAVE
4. Review which MC usernames are represented in the list and at what times they completed their saves

**Scenario 3: Verifying a bulk upload was successful**

An MC user uploaded a bulk Excel file but is unsure if all rows processed correctly.
1. Open Log Info → Action Log
2. Select the date of the upload
3. Filter by Action Type = BULK_UPLOAD
4. Review the record showing the file name, rows processed, and rows failed

---

## *Dissemination*

> **Purpose**

The Dissemination module serves as the centralized communication and
information-sharing component of iRAINS. It is designed to facilitate
the timely distribution of rainfall data, maps, reports, and related
meteorological information to operational users, agencies, and
stakeholders through an integrated email-based dissemination system.

The module enables users to compose and send emails with rainfall
products and attachments, manage recipient groups for efficient
communication workflows, and maintain records of all dissemination
activities through a dedicated email log system. By integrating
communication directly within the platform, the module improves
operational efficiency, reduces manual effort, and ensures timely
circulation of critical rainfall information.

Key objectives of this section include:

-   Supporting rapid dissemination of rainfall data and reports through
    > email.

-   Enabling organized management of recipient groups for operational
    > communication.

-   Providing centralized tracking and monitoring of sent emails.

-   Supporting dissemination workflows for HQ, MC, and SP operational
    > users.

-   Improving coordination between meteorological offices and
    > stakeholders.

-   Maintaining historical records of communication activities for
    > verification and accountability.

The Dissemination section functions as an essential operational
communication tool within iRAINS by ensuring that critical rainfall
information and meteorological products can be efficiently shared,
tracked, and managed across the organisation.

**Features**

- Provides a three-section email communication platform within iRAINS — **Send Email**, **Email Group Management**, and **Email Log** — enabling structured creation, management, and tracking of all outbound email communications.
- Supports two recipient modes: **Manual E-mail** (ad-hoc single recipient entered directly) and **User Defined** (selection from pre-configured email distribution groups).
- Allows file attachments up to 1 MB per email, with attachments encoded in Base64 for transmission as part of the email payload.
- Includes a full-featured **Email Group Management** interface for creating, editing, and deleting named distribution groups, each containing one or more email addresses stored in JSONB format in the database.
- Maintains a complete **Email Log** with recipient, subject, message body, timestamp, and delivery status (Sent or Failed) for every email sent through the system.
- Supports a date-based filter in the Email Log, enabling review of all emails dispatched on a specific date.
- Includes an **Auto Email** toggle (On/Off) for controlling automated daily reminder emails that prompt MC users to update and verify their station data.
- Provides a **Bulk Report Dissemination** capability that auto-generates Excel and map image attachments from the live iRAINS database (up to 8 attachments — 4 Excel files and 4 map images — in a single email) for comprehensive daily rainfall reporting.
- Uses **Nodemailer** with an SMTP server configured via environment variables, supporting external email delivery with TLS.

**Sub-Modules**

**Send Email**

The Send Email panel is the primary composition interface for outbound email communications. It includes:

**Recipient Selection** — A dropdown control with two options:
- **Manual E-mail:** Selecting this option reveals a text input field where the user enters a single recipient email address directly.
- **User Defined:** Selecting this option reveals a secondary dropdown populated with all saved email distribution groups. The user selects one group, and the system sends one email to each address in that group.

**Subject Field** — A text input for the email subject line.

**Message Field** — A multi-line textarea (4 rows by default) for composing the email body text.

**Attachment** — A file selector button. Users can attach a single file up to **1 MB** in size. The selected file is read into browser memory as a Base64-encoded string and stored in `localStorage` along with the filename. The attachment is included in the API payload and forwarded to the Nodemailer email service for inclusion in the outgoing email.

When the user clicks **Send**, the system iterates through all resolved recipient addresses (one for Manual, all members of the selected group for User Defined) and calls the send email API once per recipient. The send result is logged to the `email_log` table for each recipient, recording success or failure independently.

**Figure 34: iRAINS Dissemination – Compose and Send Panel**
> *[Insert screenshot here]*

**Email Group Management**

The Email Group Management sub-section provides Create, Read, Update, and Delete (CRUD) operations for named email distribution lists. The panel displays all existing groups in a table with three columns: **Group Name**, **Emails** (the list of addresses), and **Action** (Edit and Delete buttons).

**Create Group:** A form with a **Group Name** text input and an **Email** input field with a "+" button. Users add email addresses one by one; each added address is displayed in a list below the input. Clicking Submit saves the group with the full list of addresses serialised as a JSONB array in the database. Duplicate group names (case-insensitive) are rejected with a validation alert.

**Edit Group:** Clicking Edit pre-populates the form with the selected group's existing name and email list. The user can modify any field and click Update to save the changes.

**Delete Group:** Clicking Delete on a group row permanently removes the group and all its associated email addresses from the database.

**Email Log**

The Email Log presents a full history of all emails sent through the iRAINS Dissemination module. The log table displays the following columns:

- **To** — The recipient email address.
- **Subject** — The email subject line.
- **Message** — The email body text.
- **Date & Time** — The timestamp of the send attempt, formatted as DD-MM-YYYY HH:MM:SS.
- **Status** — The delivery outcome: **Sent** (success) or **Failed** (delivery error).

A **Date Picker** (Angular Material) and a **Filter** button allow the user to retrieve logs for a specific date. Selecting a date and clicking Filter fetches only the log records for that day. On initial load, all available email logs are displayed without date restriction.

An **Auto Email** control at the top of the Email Log section consists of two radio buttons labelled **On** and **Off**, with a **Submit** button. This toggle controls whether the system sends automated daily reminder emails to MC users (prompting data update and verification). The selected state is persisted in `localStorage` under the key `autoEmail`. When enabled, the backend scheduler triggers reminder emails at configured times — one reminder for data update and one for verification.

**Figure 35: iRAINS Dissemination – Email Log Viewer**
> *[Insert screenshot here]*

**Bulk Report Dissemination**

A separate bulk dissemination function (`sendBulkReports`) provides an advanced capability for operational reporting workflows. This function generates and attaches up to 8 files in a single email:
- 4 Excel files containing District, State, Subdivision, and Region-level rainfall data (generated dynamically from the live database at the time of sending).
- 4 map image attachments (if configured).

Each attachment is generated in-process without requiring a manual user download step, enabling fully automated daily rainfall report distribution to configured recipients. Attachment sizes are tracked to comply with SMTP size limits.

**Data Integration**

The Dissemination section reads distribution group data from the `email_group` table (columns: `id`, `groupname`, `emails` stored as JSONB). Email logs are written to and read from the `email_log` table (columns: `id`, `email`, `subject`, `message`, `datetime`, `status`).

When an email is sent, the backend Nodemailer function attempts delivery through the configured SMTP server. Regardless of whether delivery succeeds or fails, a log record is written to `email_log` with the appropriate status flag. This ensures complete audit coverage even for emails that fail due to SMTP or recipient errors.

For the Bulk Report Dissemination function, the system fetches District, State, Subdivision, and Region-level rainfall data from the same backend query functions used by the Rainfall Reports section, then passes the results to Excel generation functions before composing the email.

**Threshold Computation and Logic**

The Dissemination section does not apply meteorological thresholds. Its operational logic is limited to:
- Email address format validation (for manual entry and group creation).
- Duplicate group name detection (case-insensitive comparison against existing group names).
- File attachment size validation (maximum 1 MB per attachment).
- Auto Email on/off state persistence in `localStorage`.

**Back-End Architecture**

The Dissemination backend is implemented in two controllers: `Email.js` for standard email operations and `emailController.js` for bulk report generation. `Email.js` provides the `sendManualMail` and `sendMailToGroup` functions, which construct a Nodemailer transport using SMTP credentials from environment variables and dispatch the email. On success or failure, each attempt is logged via a PostgreSQL INSERT into `email_log`.

Email group CRUD operations are straightforward PostgreSQL INSERT, SELECT, UPDATE, and DELETE operations against the `email_group` table. The email addresses within each group are stored as a JSONB column, allowing flexible multi-address storage without a join table.

The auto-reminder functions (`dailyDataUpdateReminder`, `dailyDataVerificationReminder`) are designed to be triggered by the backend scheduler at configured intervals, querying the `station_daily_data_updates` table to identify centres with incomplete or unverified records and sending targeted reminders to the responsible MC contacts.

**Programming Environment**

The Dissemination frontend components are built with **Angular 16** and **Angular Material** (for the date picker in the Email Log). The backend email service uses **Nodemailer** with SMTP configuration via environment variables (`process.env.EMAIL_HOST`, `process.env.EMAIL_PORT`, `process.env.EMAIL_USER`, `process.env.EMAIL_PASS`). TLS self-signed certificate rejection is disabled for compatibility with IMD's internal SMTP server. The backend is **Node.js + Express** with **pg** for PostgreSQL operations. Excel generation for bulk reports uses **xlsx-js-style**.

**API Generation**

| Method | Endpoint | Purpose | Key Request Fields |
|---|---|---|---|
| POST | /send-email | Send email to one recipient | { to, subject, text, attachments: [] } |
| GET | /emailgroup | Fetch all email distribution groups | None |
| POST | /emailgroup | Create a new distribution group | { groupName, emails: JSON string } |
| PUT | /email-dissemination/defined-email/:id | Update an existing group | { groupName, emails } |
| DELETE | /email-dissemination/defined-email | Delete a group by ID | { data: id } |
| GET | /emaillog | Fetch all email log records | None |
| GET | /email-dissemination/email-log?date= | Fetch email log for a specific date | date param (YYYY-MM-DD) |

**User Role and Management**

<a id="table-27"></a>

**Table 27: Dissemination – User Access and Roles**

| Feature / Sub-Module | HQ | MC / RMC | SP / Guest |
|---|---|---|---|
| Compose and send email (manual recipient) | Yes | Yes | No |
| Compose and send email to a defined group | Yes | Yes | No |
| Attach files to outgoing email | Yes | Yes | No |
| View all email distribution groups | Yes | Yes | No |
| Create new email group | Yes | Yes | No |
| Edit existing email group | Yes | Yes | No |
| Delete email group | Yes | Yes | No |
| View Email Log (all dates) | Yes | Yes | No |
| Filter Email Log by date | Yes | Yes | No |
| Toggle Auto Email (On/Off) | Yes | Yes | No |
| Bulk Report Dissemination (auto-generate attachments) | Yes | No | No |

---

**Dissemination — Recipient Group Management Reference**

Recipient groups are the core organizational unit of the Dissemination section. Each group encapsulates a list of email addresses for a specific audience category. The following table describes the typical recipient group categories used in IMD operations:

| Group Category | Typical Recipients | Email Types Sent |
|---|---|---|
| IMD Internal — Hydromet | HQ meteorologists, Hydromet Division officers | Daily rainfall summaries, monsoon activity reports, verification reminders |
| IMD Internal — Centres | All MC and RMC operational staff | Rainfall maps, weekly departure reports, season-end summaries |
| State Disaster Management Authorities | SDMA officers for each state | Significant rainfall reports, flood monitoring reports, heavy rainfall advisories |
| National Disaster Management | NDMA and NDRF liaison contacts | Summary of Weather bulletin, extreme event reports |
| Agricultural Meteorology Users | State agriculture departments, ICAR centres | Weekly rainfall departure reports, seasonal cumulative charts |
| Media and Press | PIB, regional media representatives | Weekly monsoon summary, seasonal performance overview |
| Research Partners | IITM, NCMRWF, IMD research divisions | Technical monsoon assessment, model verification reports |
| FMO Network | All Flood Meteorological Offices | Catchment rainfall reports, QPF verification updates |

The HQ administrator creates and maintains these groups in the email_group table. As personnel change, the administrator updates the group membership to ensure accurate delivery. All group management changes are recorded in the Action Log.

---

**Dissemination — Automated Email System Reference**

iRAINS supports automated scheduled email dispatch through a server-side cron job mechanism. The following automated email types are configured:

| Automated Email Type | Schedule | Trigger Condition | Recipient Group |
|---|---|---|---|
| Data Entry Reminder | Daily at 07:30 IST | Centres with Pending count > threshold | Responsible MC/RMC contacts |
| Verification Reminder | Daily at 10:30 IST | Centres with Not Verified count > threshold | HQ verification officer |
| Daily Rainfall Bulletin | Daily at 11:00 IST | After data cut-off; generates auto-PDF and sends | Configured internal distribution group |
| Weekly Departure Report | Every Wednesday at 12:00 IST | End of IMD standard week | Extended distribution list |
| Seasonal Summary | At season end (Sep 30, Dec 31, Feb 28, May 31) | Calendar trigger | Full distribution list |

The configuration for automated emails — recipients, schedules, thresholds, and attachment types — is managed by the HQ administrator through the application's backend configuration file. Changes to automated email schedules require a server restart or a hot-reload of the configuration, depending on the deployment environment.

---

**Dissemination — Email Log Reference**

The Email Log provides a permanent audit trail of all outgoing communications from iRAINS. The following fields are recorded for each sent email:

| Field | Description | Example |
|---|---|---|
| Log ID | Auto-incremented unique identifier | 4521 |
| Timestamp | Date and time the email was sent (IST) | 2024-07-15 11:03:45 |
| Sent By | Username of the iRAINS user who triggered the send | hq_dissem_01 |
| Send Type | MANUAL (user-initiated) or AUTO (scheduled) | AUTO |
| Recipient Group | Name of the recipient group selected | "State DMAs — All India" |
| Recipient Count | Number of email addresses in the group at time of send | 36 |
| Subject | Full email subject line | "Daily Rainfall Report — 14 July 2024" |
| Attachments | Comma-separated list of attached filenames | "District_IND_20240714.pdf, MA_Departure_Map.jpeg" |
| Status | SENT (successful) or FAILED (with error description) | SENT |
| Error Message | Populated only if Status = FAILED; SMTP error details | (empty for successful sends) |

The Email Log can be filtered by date to review all communications sent on a specific day. For compliance and audit purposes, the complete log should be exported periodically and archived. The current interface does not support pagination beyond the most recent entries, so direct database queries may be necessary for historical log review.

**Dissemination — Best Practices for Operational Email Management**

The following best practices are recommended for effective management of the Dissemination module in an operational IMD context:

1. **Review recipient groups quarterly:** Personnel changes at state governments, NDMA, and partner organisations are frequent. A quarterly review of all recipient groups ensures that emails reach current contacts and eliminates bounced addresses. The HQ administrator should coordinate with the IMD liaison officer to maintain an up-to-date contact database.

2. **Test new group configurations before operational use:** Before activating a new recipient group for the automated daily bulletin, send a test email to the group and confirm delivery. Check the Email Log for any FAILED records. Address SMTP errors (e.g., invalid addresses, blocked senders) before adding the group to the automated schedule.

3. **Coordinate attachment timing with the data update cycle:** Attachments generated from the Rainfall Reports or Rainfall Map modules should be generated after the daily aggregation completes (after 11:30 IST) to ensure they reflect current-day observations. If the automated email is scheduled before 11:30, the attachment may use the previous day's data. HQ administrators should align the automated email schedule (currently 11:00 IST for the Daily Bulletin) with the actual data availability time if the schedule is adjusted.

4. **Archive the Email Log monthly:** The Email Log does not auto-purge old records, but the application interface may not display records beyond the most recent 100 entries. The HQ administrator should run a monthly query on the email log table to export the full month's record as a CSV and store it in the operational archive.

5. **Maintain an emergency override contact:** For cases where a critical event (cyclone landfall, catastrophic flood) requires immediate ad hoc notification outside the normal distribution schedule, ensure at least one HQ user knows how to compose a manual email with an emergency recipient group containing NDMA, IMD DG Office, and key state authorities. This group should always remain up to date even if it is rarely used.

---

# ***iRAINS Detailed Module Reference*** {#module-reference .unnumbered}

This section provides a detailed operational and technical reference for each of the eighteen iRAINS sub-sections. For each module, the reference covers interface elements, filter controls, data interpretation guidelines, output formats, and operational notes that supplement the core documentation in the preceding sections. This reference is intended for day-to-day operational users who require a concise, practical guide to each module.

---

## **Module I: Rainfall Map — Detailed Reference**

### **Filter Panel Reference**

The Rainfall Map's filter panel is the primary control interface for the module. The following controls are available:

- **Date Selector:** A date-picker field allowing users to select any date from the earliest date with available data to the current day. For weekly and cumulative modes, this represents the end date of the aggregation period. The calendar highlights dates with data availability indicators.

- **Map Type Toggle:** Three-state toggle selecting Actual Rainfall, Departure from Normal, or Normal Rainfall as the displayed variable. The colour scale and legend update automatically when the type is changed.

- **Geographic Level Selector:** Dropdown with options: Country, Region, State, Subdivision, District (Pan-India), District (Central India), District (North-West India), District (East & North-East India), District (South Peninsula), Block (Daily), Block (AWS), MC/RMC Regional. Selecting a regional district option restricts the displayed area to the corresponding geographic zone.

- **Period Selector:** Radio or toggle control selecting Daily (single day), Weekly (7-day sum), or Cumulative (season-to-date or year-to-date) aggregation. Weekly mode uses the IMD standard week boundary (Thursday to Wednesday). Cumulative mode accumulates from the season start date to the selected end date.

- **Download Button:** Triggers PDF export of the current map view with title, legend, date, and IMD header.

### **Colour Scale Reference**

The map uses a categorical colour scale rather than a continuous gradient. Each category corresponds to a fixed colour:

| Map Variable | Category | Colour |
|---|---|---|
| Departure | Large Excess (≥+60%) | Blue |
| Departure | Excess (+20% to +59%) | Light Blue |
| Departure | Normal (−19% to +19%) | Green |
| Departure | Deficient (−20% to −59%) | Orange/Red |
| Departure | Large Deficient (−60% to −99%) | Yellow |
| Departure | No Rain (−100%) | White |
| Departure | No Data | Grey |
| Actual | Coloured by rainfall amount | Gradient (light yellow → dark blue) |
| Normal | Coloured by normal amount | Gradient (light yellow → dark blue) |

### **Interpretation Guidelines**

When interpreting the Departure map, users should keep the following in mind:

- A mosaic of blue and green areas during the monsoon season typically indicates an active monsoon with above-normal coverage.
- Persistent yellow and orange areas in the same subdivision across multiple consecutive days indicate developing or ongoing drought conditions and should trigger consultation with the Rainfall Departures section for seasonal context.
- Grey areas do not necessarily indicate zero rainfall — they indicate absence of data. In high-coverage areas, grey may indicate a submission delay from the responsible centre rather than actual absence of rain.
- The Block-level map is updated once per day following the morning data cut-off and reflects only the previous 24-hour period. It does not support weekly or cumulative modes.

### **Operational Notes**

The MC/RMC Regional Maps sub-view is designed specifically for centre-specific monitoring. When a user at a regional centre opens this view, the system highlights their centre's jurisdiction area. This view is particularly useful for the morning briefing at each centre, where the forecaster reviews the departure pattern over their operational domain before preparing district-level advisories.

The Station Coverage Statistics panel should be consulted alongside the map for any date where a large proportion of districts show grey (No Data). If the coverage panel indicates that only 40% of stations have reported — which is not uncommon very early in the morning before all centres have completed data entry — the map should be interpreted as preliminary. The final day's map should be reviewed after the 07:50 UTC data cut-off.

---

## **Module II: iRAINS Dashboard — Detailed Reference**

### **Interface Layout**

The Dashboard is organized into four visual regions:

1. **Top Banner:** Displays the current date, the national actual rainfall figure, and the national departure percentage for the selected day. A running marquee shows the five stations with the highest rainfall in the last 24 hours.

2. **Map Panel (Left/Centre):** An interactive Leaflet map occupying approximately half the screen width. The map defaults to Subdivision-level departure view for the current day. Users can click on any polygon to see a popup with that unit's actual, normal, and departure values.

3. **Statistics Panel (Right):** A tabbed panel showing national, regional, and subdivision-level summary statistics in text and chart format. Tabs switch between Departure Charts, Category Distribution, and Top/Bottom Rankings.

4. **Comparison Panel (Bottom, toggleable):** When enabled, a side-by-side view shows two date periods simultaneously, allowing direct comparison of rainfall patterns between any two dates.

### **Interactive Map Controls**

- **Click on polygon:** Shows a popup with the unit's actual (mm), normal (mm), departure (%), and category.
- **Hover:** Highlights the polygon boundary. On mobile, a long-press simulates hover.
- **Zoom controls:** Standard Leaflet zoom in/out buttons. Scroll wheel zooms on desktop.
- **Level toggle (above map):** Switches between State, Subdivision, and District level views. The map reloads data at the new level without losing the current date selection.
- **Base map toggle:** Switches between a minimal basemap and a satellite imagery basemap, useful for geographic orientation.

### **Statistics Panel Reference**

**Departure Chart tab:** Shows a horizontal bar chart with one bar per homogeneous region. Each bar represents that region's area-weighted departure from normal for the selected day. Positive bars extend right (excess); negative bars extend left (deficient). The chart allows quick comparison of rainfall anomaly across India's major meteorological regions.

**Category Distribution tab:** Shows a table and/or donut chart showing how many subdivisions, states, or districts fall into each departure category (LE, E, N, D, LD, NR, ND) for the selected date. This view is the fastest way to characterise the overall rainfall situation nationally — for example, "16 of 36 subdivisions are in Deficient or Large Deficient category" is immediately visible.

**Top/Bottom Rankings tab:** Lists the top 10 and bottom 10 geographic units by absolute rainfall amount and by departure percentage for the selected level and date. This helps quickly identify the wettest and driest areas in the country for operational reporting.

### **Comparison Mode**

When the Comparison Mode toggle is activated, a second date selector appears below the map. Selecting a second date loads a split-view showing both dates' departure maps side by side. This is particularly useful for:
- Comparing the current week with the same week in the previous year.
- Showing the before/after pattern around a significant weather system.
- Demonstrating the monsoon advance by comparing an early monsoon week with a later week.

---

## **Module III: Rainfall Graphs — Detailed Reference**

### **Season Boundaries**

The season selector applies the following date ranges for data retrieval:

| Season | Start Date | End Date |
|---|---|---|
| Winter | January 1 | February 28 (or 29 in leap years) |
| Pre-Monsoon | March 1 | May 31 |
| Southwest Monsoon | June 1 | September 30 |
| Post-Monsoon (Northeast Monsoon) | October 1 | December 31 |

These boundaries are fixed and apply uniformly across all regions. For regional assessments where the effective monsoon onset and withdrawal dates differ from the national dates, users should interpret the graph with the known local onset/withdrawal dates in mind.

### **Homogeneous Region Definitions**

The five regional options in the Rainfall Graphs section correspond to IMD-defined Homogeneous Rainfall Regions:

| Region Option | Description |
|---|---|
| Pan India | All-India aggregate — all subdivisions included |
| Central India | Includes Vidarbha, West Madhya Pradesh, East Madhya Pradesh, Chhattisgarh, and neighbouring subdivisions |
| North-West India | Includes Punjab, Haryana, Chandigarh, Delhi, West Rajasthan, East Rajasthan, West Uttar Pradesh, East Uttar Pradesh, and Himachal Pradesh |
| East & North-East India | Includes West Bengal, Bihar, Jharkhand, Odisha, Assam, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim, and Arunachal Pradesh |
| South Peninsula | Includes Coastal and North Interior Karnataka, South Interior Karnataka, Rayalaseema, Tamil Nadu, Coastal Andhra Pradesh, Telangana, Konkan & Goa, and Madhya Maharashtra |

### **Reading the Chart**

The Rainfall Graphs chart renders as a combined column-and-line series:

- **Blue columns:** Daily actual rainfall (mm) for each day in the selected season.
- **Red line:** Daily normal rainfall (mm) for the same days, representing the long-period average.

In cumulative mode:
- **Blue line:** Running cumulative sum of actual rainfall from the season start.
- **Red line:** Running cumulative sum of normal rainfall from the season start.

When the cumulative blue line tracks consistently above the red line, the season is running above normal. When it tracks below, the season is deficit. The gap between the lines widens during active spells and narrows during break conditions.

### **Interpretation Guidelines**

- An abrupt vertical rise in the daily bar chart indicates a heavy rainfall event or the passage of a cyclonic system, monsoon depression, or mid-tropospheric cyclone.
- A sustained sequence of near-zero bars in July or August, especially over central or northwest India, indicates a break monsoon condition with the monsoon trough displaced northward.
- The year-over-year comparison function (selecting different years for the same season and region) is a powerful tool for anomaly characterisation — if the current year is the wettest in five years, this is immediately visible when multiple year traces are overlaid.

---

## **Module IV: NWP Rainfall Products — Detailed Reference**

### **Model Characteristics Reference**

| Model | Type | Horizontal Resolution | Domains Covered | Initialization | Primary Use |
|---|---|---|---|---|---|
| WRF ARW | Regional Deterministic | ~9 km over India | India and surrounding region | 00Z daily | Short-range (D+1 to D+3) detail for India |
| IMD GFS | Global Deterministic | ~12 km | Global | 00Z daily | Medium-range (D+1 to D+7) India |
| IMD GFS-BC | Global Deterministic (bias-corrected) | ~12 km | India | 00Z daily | Bias-corrected medium-range for India |
| NCUM | Global Deterministic | ~17 km | Global | 00Z daily | Medium-range UK Met Office NWP guidance |
| NCUM-R 00Z | Regional Deterministic | ~4 km | India and Bay of Bengal region | 00Z daily | High-resolution short-range |
| NCUM-R 12Z | Regional Deterministic | ~4 km | India and Bay of Bengal region | 12Z daily | High-resolution short-range (afternoon run) |
| GEFS | Global Ensemble | ~28 km | Global | 00Z daily | Probabilistic QPF, medium to extended range |
| NEPS | National Ensemble | ~23 km | India | 00Z daily | Probabilistic QPF, ensemble-based |

### **Reading Forecast Maps**

NWP forecast maps in iRAINS display 24-hour accumulated rainfall for the forecast day. The colour scale typically ranges from zero (white or light grey) through increasing rainfall amounts to extreme values (dark red or purple). Users should refer to the legend displayed alongside each map image for the specific colour-to-rainfall mapping used by each model's output visualisation system.

**MC View vs. River Basin View**

The MC (Meteorological Centre) view shows forecast rainfall fields with India's Meteorological Centre boundaries superimposed. This allows forecasters at each centre to focus on their area of responsibility and extract the model-guidance rainfall amount relevant to their domain.

The River Basin view overlays the forecast rainfall on river basin boundaries as defined by India's Central Water Commission. This view is specifically designed for use by Flood Meteorological Offices (FMOs), who issue quantitative precipitation forecasts for specific river catchments and require rainfall estimates organized by hydrological catchment rather than by administrative boundary.

### **Probabilistic QPF Interpretation**

The PQPF (Probabilistic Quantitative Precipitation Forecast) maps from GEFS and NEPS ensemble systems show the probability that rainfall will exceed a specified threshold at each grid point. Key thresholds used in iRAINS are:

- 25 mm / 24 hours (heavy rainfall threshold for many advisories)
- 64.5 mm / 24 hours (heavy rainfall classification)
- 115.5 mm / 24 hours (very heavy rainfall classification)
- 204.4 mm / 24 hours (extremely heavy rainfall classification)

A grid point showing 70% probability of exceeding 64.5 mm indicates that 70% of the ensemble members predicted rainfall exceeding the heavy rainfall threshold at that location. High-probability cells (>60%) for extreme thresholds warrant careful attention in impact-based forecasting.

### **Model Uncertainty and Multi-Model Consensus**

No single NWP model consistently outperforms all others in all situations. Operational forecasters use iRAINS's multi-model capability to identify areas of consensus and divergence:

- Areas where multiple models agree on heavy rainfall are higher-confidence forecasts.
- Areas where models disagree significantly warrant more cautious forecast language.
- The bias-corrected IMD GFS-BC product is typically preferred over the raw IMD GFS when statistically significant biases have been identified in the model's India-domain performance.
- The NCUM-R products, with their finer resolution, often resolve rainfall gradients associated with orographic effects (Western Ghats, Eastern Ghats, Himalayan foothills) more sharply than coarser global models.

---

## **Module V: Rainfall Statistics — Detailed Reference**

### **Table Structure Reference**

The Rainfall Statistics table is rendered with the following fixed column structure:

| Column | Content |
|---|---|
| S.No. | Sequential row number for reference |
| Name | District / Subdivision / State / Region / Country name |
| Day Actual (mm) | Observed rainfall for the selected date at this geographic unit |
| Day Normal (mm) | Climatological normal rainfall for the selected date |
| Day Departure (%) | Percentage departure of Day Actual from Day Normal |
| Day Category | IMD departure category code (LE / E / N / D / LD / NR / ND) |
| Period Actual (mm) | Observed rainfall for the full selected period at this unit |
| Period Normal (mm) | Climatological normal for the full selected period |
| Period Departure (%) | Percentage departure of Period Actual from Period Normal |
| Period Category | IMD departure category code for the period |

Category cells are colour-filled matching the IMD standard departure category colours. Column widths are fixed to ensure consistent rendering in both on-screen display and exported PDF/Excel formats.

### **IMD Week Boundary System**

iRAINS's weekly statistics follow IMD's standard weekly reporting calendar, in which each week begins on Thursday and ends on Wednesday. This convention is used consistently across all time-referenced statistics in iRAINS, including the weekly columns in the Rainfall Departures section and the Weekly mode in the Statistics table. When a user selects "Weekly" mode in the Rainfall Statistics section and chooses a date that falls mid-week, the system automatically extends the period to cover the full IMD week ending on the nearest Wednesday on or before the selected date.

### **Interpreting the Dual-Column Layout**

The side-by-side Day and Period columns in the Rainfall Statistics table are designed to answer two distinct questions simultaneously:

- **Day column:** "How did today's rainfall compare with normal for today?" — useful for identifying areas experiencing an unusually wet or dry single day.
- **Period column:** "How has this period as a whole compared with the cumulative normal?" — useful for characterising whether a region is running surplus or deficit over the current week or season to date.

A unit may be classified as Excess for the day (a single heavy-rain day lifted the day's value well above normal) while being Deficient for the period (a single wet day cannot overcome a prolonged dry spell). Reading both columns together provides a more complete picture than either alone.

---

## **Module VI: Rainfall Departures — Detailed Reference**

### **Matrix Layout Reference**

The Rainfall Departures section displays data as a two-dimensional table (matrix) with the following orientation:

- **Rows:** Geographic units — either Subdivisions or Districts, depending on the level selected.
- **Columns:** Time intervals — either individual weeks (in weekly mode) or cumulative periods (in cumulative mode).
- **Cells:** The departure percentage for that geographic unit in that time interval, colour-coded by category.

In weekly mode, columns are labelled with the start and end date of each IMD standard week in the selected season. In cumulative mode, columns are labelled with the cumulative period end date, showing how the season total departure evolved from week to week as the season progressed.

### **Season Selection and Column Generation**

When the user selects a season and year, the system calculates all weekly boundaries for that season automatically. For the Monsoon season (June 1–September 30), this generates approximately 17–18 weekly columns. For shorter seasons such as Winter (January–February), only 4–5 weekly columns are generated. Columns for weeks that have not yet completed (because the season is currently ongoing) appear with the data available up to the most recent completed day.

### **Reading Colour Patterns Across the Matrix**

The colour pattern across the matrix provides rich information about the spatial and temporal evolution of rainfall anomalies:

- **Horizontal colour band (same geographic unit, multiple weeks):** Reveals whether a particular subdivision has been consistently wet or dry across the season. A row that is predominantly yellow/orange indicates a severely deficit subdivision throughout the season.
- **Vertical colour band (same week, multiple geographic units):** Reveals which week had widespread excess or widespread deficit across the country. A week where most cells are yellow/orange corresponds to a break monsoon episode.
- **Diagonal pattern:** Tracks the spatial progression of an active spell — cells transitioning from Normal to Excess moving down-right across the matrix indicates a monsoon depression tracking across the country.

---

## **Module VII: QPF Verification Report — Detailed Reference**

### **Available Report Years and Coverage**

QPF Verification Reports are archived PDFs prepared by Flood Meteorological Offices (FMOs) and the Damodar Valley Corporation (DVC). The reports cover the performance of quantitative precipitation forecasts issued during the monsoon season of each year.

| Year | Report Type | Coverage Area | Status |
|---|---|---|---|
| 2020 | FMO + DVC Verification | All major FMO catchments | Available |
| 2021 | FMO + DVC Verification | All major FMO catchments | Available |
| 2022 | FMO + DVC Verification | All major FMO catchments | Available |

Additional years may be added as the archive expands. The system administrator adds new report files to the assets directory, after which they appear automatically in the year-tab navigation.

### **Verification Metrics in the Reports**

Users reviewing QPF Verification Reports should be familiar with the following standard objective verification scores that appear in the documents:

- **Probability of Detection (POD):** The fraction of observed rainfall events that were correctly forecast. High POD values (approaching 1.0) indicate few misses.
- **False Alarm Ratio (FAR):** The fraction of forecast rainfall events that were not observed. Low FAR values (approaching 0) indicate few false alarms.
- **Critical Success Index (CSI):** Also called Threat Score, this combines POD and FAR into a single measure ranging from 0 (no skill) to 1 (perfect). It is the primary verification metric used in IMD's QPF performance assessments.
- **Bias Score:** The ratio of the number of forecast events to the number of observed events. A bias > 1 indicates over-forecasting; < 1 indicates under-forecasting.
- **Mean Error (ME) / Bias:** The average difference between forecast and observed rainfall amounts. Positive ME indicates a systematic over-forecast.
- **Root Mean Square Error (RMSE):** Measures the average magnitude of forecast errors, penalising large errors more heavily than small ones.

### **Using Verification Reports for Operational Learning**

The primary operational use of the QPF Verification Report is to identify systematic patterns in forecast performance that can guide future forecast decisions:

- If verification shows consistent under-forecasting of heavy rainfall over orographic regions (e.g., the Western Ghats), forecasters may apply an upward adjustment to model QPF guidance for those regions.
- If ensemble-based models (GEFS, NEPS) consistently out-performed deterministic models (WRF ARW, GFS) for Day+5 forecasts in previous years, forecasters may place relatively more weight on ensemble products at longer lead times.
- Catchment-specific verification metrics help FMO forecasters understand the strengths and limitations of model guidance for their specific area of responsibility.

---

## **Module VIII: Rainfall Reports — Detailed Reference**

### **Report Format Reference**

Generated PDF reports follow a standardised IMD layout:

**Cover Section:** IMD header and logo, report title (e.g., "District-wise Rainfall Distribution Report"), the selected date range, the generation timestamp, and the geographic level.

**Data Table Section:** A multi-column table with the following structure depending on the geographic level selected:

- **District-level report:** Districts grouped under States, States grouped under Subdivisions. For each district: District Name, Period Actual (mm), Period Normal (mm), Departure (%), Category (with colour fill).

- **State-level report:** States in alphabetical or standard IMD ordering. For each state: State Name, Period Actual (mm), Period Normal (mm), Departure (%), Category.

- **Subdivision-level report:** All meteorological subdivisions with the same column structure.

- **Region-level and Country-level reports:** Homogeneous regions and national totals with the same structure.

**Legend Section:** A colour reference table showing the seven departure categories and their corresponding colours, appended at the end of the report.

### **Report Naming Convention**

Downloaded PDF reports are named according to the following convention:
`{Level}_{CountryCode}_{StartDate}_{EndDate}_{Timestamp}.pdf`

For example: `District_IND_20240601_20240630_20240701_0905.pdf`

This naming ensures that reports generated for the same period but at different times can be distinguished, which is important when corrections to underlying data lead to a revised report being generated after the original was distributed.

### **Data Currency and Report Regeneration**

Because Rainfall Reports are generated dynamically from the live database, a report generated at 08:00 IST and the same report generated at 15:00 IST may differ if additional data was entered or corrections were made between those times. Users who distribute reports formally should note the generation timestamp and archive the specific PDF file distributed, so that the exact version sent to stakeholders can be retrieved if questions arise.

---

## **Module IX: Spatial Distribution — Detailed Reference**

### **Calculation Methodology Reference**

For a given geographic unit (subdivision, state, district, or river basin) and a given date or period, the Spatial Distribution classification is computed as follows:

1. Count all active meteorological stations assigned to the geographic unit.
2. Count the stations in that unit that recorded rainfall ≥ 0.1 mm on the selected date (or on at least one day in the selected period for multi-day modes).
3. Compute the percentage: (Stations with Rainfall / Total Active Stations) × 100.
4. Classify the percentage into the four spatial distribution categories.

The 0.1 mm threshold is used as the minimum measurable rainfall value — values below this threshold are considered effectively zero or instrument noise. This threshold is consistent with IMD's standard definition of a "rain day."

### **Spatial Distribution Classification Reference**

| Category | Percentage of Stations with Rainfall ≥ 0.1 mm | Map Colour Code |
|---|---|---|
| Isolated | 0% to 25% | Bright Green (#03ff3f) |
| Scattered | >25% to 50% | Dark Green (#00683a) |
| Fairly Widespread | >50% to 75% | Cyan (#00fcf1) |
| Widespread | >75% | Blue (#3400f6) |

### **River Basin Level View**

In addition to standard administrative levels, the Spatial Distribution section supports a River Basin level view. This view classifies rainfall distribution within the boundaries of India's major river basins as defined by the Central Water Commission. This perspective is particularly useful for flood monitoring applications, where the relevant question is not "what is the distribution across a state?" but "what percentage of the catchment is receiving rainfall?"

### **Multi-Day Period Interpretation**

In multi-day (weekly, cumulative) mode, the Spatial Distribution section counts stations that received rainfall on at least one day during the period. This is more permissive than a single-day count and will typically result in higher distribution percentages than the daily view. Users should be aware of this distinction when comparing a weekly distribution result with a daily result.

### **Operational Importance of Spatial Distribution**

The Spatial Distribution classification is one of the inputs to the Monsoon Activity classification computed in the next section. It is also an independent indicator of the character of a rainfall event:

- **Isolated rainfall:** Suggests localised convective activity — afternoon thundershowers over individual hill stations or coastal areas.
- **Scattered rainfall:** Indicates patchy convective activity, possibly associated with a trough or line of convergence.
- **Fairly Widespread:** Indicates organized rainfall, often associated with a monsoon trough in its normal position, a mid-tropospheric cyclone, or a well-developed low-pressure area.
- **Widespread rainfall:** Indicates a well-organized, large-scale rainfall event — an active monsoon phase, a cyclonic storm, or a monsoon depression's broad circulation.

---

## **Module X: Monsoon Activity — Detailed Reference**

### **Classification Algorithm Reference**

The Monsoon Activity classification applies the following decision logic in the order listed. The first matching condition determines the classification:

**Priority 1 — Vigorous:**
- Rainfall Ratio R > 4.0
- AND spatial distribution = Widespread (>75%)
- AND (for SW Monsoon): at least one station has recorded >80 mm

**Priority 2 — Active:**
- 1.5 ≤ R ≤ 4.0
- AND (for SW Monsoon): at least one station has recorded >50 mm AND spatial distribution is Fairly Widespread or Widespread
- (For NE Monsoon): the R criterion alone is sufficient — no heavy-station count requirement

**Priority 3 — Subdued:**
- R < 1.0
- AND spatial distribution was Isolated or Scattered on the current day
- AND spatial distribution was also Isolated or Scattered on the previous day

**Priority 4 — Weak:**
- R < 0.5 (and Subdued criterion not met, or heavy rain present on one of the two days)

**Priority 5 — Normal:**
- Default — all other conditions not met

### **Season Assignment**

The monsoon classification algorithm uses the following season assignment to determine which criteria to apply:

- **SW Monsoon criteria applied:** June 1 to September 30
- **NE Monsoon criteria applied:** October 1 to December 31
- Outside these periods, the classification may still be computed but carries less direct meteorological meaning as an "activity" classification.

### **Regional Thresholds for Heavy Rainfall Counts**

For SW Monsoon Active and Vigorous classification, the heavy-rain station count thresholds vary by region:

| Region | Threshold for Active | Threshold for Vigorous |
|---|---|---|
| Peninsular India (south of 15°N) | 1 station >50 mm | 1 station >80 mm |
| Central India (15°N to 25°N) | 1 station >30 mm | 1 station >50 mm |
| North India (north of 25°N) | 1 station >25 mm | 1 station >40 mm |

These thresholds reflect the regionally varying relationship between rainfall intensity and monsoon activity, accounting for the typically higher rainfall intensities seen in peninsular coastal regions compared with arid and semi-arid northern India.

### **Subdued Monsoon Two-Day Rule**

The requirement that both the current day and the previous day show Isolated or Scattered distribution before classifying a subdivision as Subdued prevents a single dry day from triggering the classification. This is important because a single day of low coverage may reflect measurement gaps, late data submission, or a temporary pause in an otherwise active system, rather than a genuine weakening of the monsoon circulation. The two-day requirement establishes a more robust signal.

### **Map Interpretation**

The Monsoon Activity map uses a five-colour scheme distinct from the departure map. Active and Vigorous areas (orange and red) indicate where the monsoon is performing most strongly — typically associated with the passage of a monsoon depression, an off-shore vortex, or an active monsoon trough. Weak and Subdued areas (yellow and grey) mark where the monsoon is least active — often corresponding to break monsoon conditions, the monsoon trough's northward displacement, or the withdrawal phase.

---

## **Module XI: Data Entry — Detailed Reference**

### **Station Filter Panel Reference**

The station filter panel in the Data Entry section contains the following controls:

- **Region Selector:** Filters stations to those within the selected homogeneous meteorological region.
- **MC/RMC Selector:** Restricts the list to stations assigned to a specific Meteorological or Regional Meteorological Centre. MC users see only their own centre; HQ users can select any centre.
- **State Selector:** Further filters to a specific state within the selected region and centre.
- **District Selector:** Narrows to a specific district within the selected state.
- **Date Selector:** Sets the date for which data is being entered or reviewed. Defaults to the current date but can be set to any past date for late entry or correction.
- **Station Type Filter:** Optionally restricts the table to show only ORG, ARG, or AWS stations.

Applying multiple filters simultaneously narrows the station table. Clicking the Reset Filter button returns all dropdowns to their default (all) state.

### **Inline Data Entry Table Reference**

Each row in the data entry table represents one station. The columns are:

| Column | Description |
|---|---|
| Station Code | The 13-digit hierarchical station identifier |
| Station Name | Official station name as recorded in station_details |
| Station Type | ORG / ARG / AWS |
| District | Administrative district of the station |
| Previous 3 Days | Read-only columns showing rainfall for the three preceding days |
| Today's Entry | Editable input field for today's rainfall in mm |
| Submission Status | Indicator showing whether today's entry has been saved |

The "Previous 3 Days" columns provide temporal context that helps data entry staff identify obvious data continuity anomalies before submission — for example, a reading of 85 mm on a day when all surrounding stations showed 0 mm may warrant verification before saving.

### **Bulk Upload Template Reference**

The bulk upload Excel template contains the following columns:

| Column | Required | Description |
|---|---|---|
| Station Code | Yes | 13-digit station code — must match exactly |
| Station Name | No | Station name (informational only, not used in processing) |
| Date | Yes | Date in DD/MM/YYYY format |
| Rainfall (mm) | Yes | Observed rainfall in millimetres; enter 0 for no rainfall; leave blank for no data |

The maximum number of rows supported per bulk upload file is 5,000. Files larger than this should be split across multiple uploads. The uploaded file must be in .xlsx format; .xls and .csv files are not supported.

After upload, the system returns a processing summary showing: total rows processed, rows successfully inserted/updated, rows with validation errors (with the specific row number and error description), and rows with unrecognised station codes.

### **Station Management (HQ Only)**

HQ administrators access Station Management through a dedicated tab or button in the Data Entry section. The Station Management interface provides three operations:

**Add Station:** Opens a form with the following required fields:
- Station Code (13 digits, must be unique)
- Station Name
- Station Type (ORG / ARG / AWS)
- Latitude (decimal degrees)
- Longitude (decimal degrees)
- Elevation (metres above mean sea level)
- State, District, Block (administrative assignment)
- MC/RMC Code (centre responsible for data entry)

**Edit Station:** Retrieves existing station metadata into an editable form. All fields except Station Code can be modified. Changes are saved with an audit log entry.

**Delete Station:** Marks the station as deleted and records the full station details in the `deletedstationlog` table. Deleted stations no longer appear in the Data Entry or Verification sections.

---

## **Module XII: Significant Rainfall — Detailed Reference**

### **Threshold Reference**

The Significant Rainfall section uses the following IMD rainfall intensity thresholds as suggested default values:

| Threshold (mm per day) | IMD Intensity Class | Typical Application |
|---|---|---|
| 0.1 | Very Light | Detect any measurable rainfall |
| 2.5 | Light | Standard rain-day threshold |
| 15.6 | Moderate | Beginning of moderate rainfall events |
| 64.5 | Heavy | Heavy rainfall — advisory threshold |
| 115.6 | Very Heavy | Very heavy rainfall — warning threshold |
| 204.5 | Extremely Heavy | Extremely heavy rainfall — extreme warning |

Users may enter any numeric threshold value, not restricted to these standard values. Custom thresholds are useful for specific applications — for example, filtering for stations receiving more than 50 mm to identify potential flash flood triggers in hilly terrain, or filtering for more than 300 mm to identify the most extreme stations during a cyclonic landfall event.

### **Region and Unit Filter**

The Significant Rainfall section provides filter controls for:

- **Date:** Any single date for which station data exists.
- **Unit (mm / cm):** Toggle between millimetre and centimetre display. The threshold entry converts accordingly. Note that all underlying data is stored and computed in millimetres; centimetre display is a presentational conversion only.
- **Region Filter:** Optionally restricts results to a specific homogeneous region, state, subdivision, or district. All geographic levels are supported. Leaving the region filter at "All India" returns all stations that met the threshold anywhere in the country.

Results are returned as a table with: Station Name, Station Code, State, District, Subdivision, Latitude, Longitude, and Rainfall Amount.

### **Operational Applications**

**Post-Event Survey:** After a significant rainfall event (cyclone, monsoon depression, off-shore vortex), the Significant Rainfall section is used to identify which specific stations recorded the heaviest rainfall during the event. This list is used to prepare the Exceptional Rainfall Report and to notify district administrations where flooding risk is elevated.

**Daily Heavy Rainfall Identification:** During the active monsoon season, the section is run each morning after data entry is complete to identify any stations that exceeded the heavy rainfall threshold (64.5 mm) on the previous day. The results are included in the daily morning meteorological briefing to the Director General.

**Climate Extremes Research:** Researchers use the section to identify dates and locations of extreme rainfall events for specific time periods, building an inventory of historical extreme events at the station level.

---

## **Module XIII: Verification HQ — Detailed Reference**

### **Interface Layout Reference**

The Verification HQ section is divided into three views accessible via tabs:

**Daily Mode Tab:** Shows the verification status for a single selected date. The main table lists each MC/RMC with: Centre Name, Total Stations Assigned, Stations Updated Today, Stations Pending, Stations Verified, Stations Not Verified. A drill-down button for each centre expands the view to show individual station data with their submitted values and verification status.

**Cumulative Mode Tab:** Displays a transposed matrix with MC/RMC centres as rows and dates as columns. Each cell shows the number of verified stations for that centre on that date. This view provides a longitudinal picture of each centre's verification performance over a date range, making it easy to identify centres that consistently lag in verification completion.

**Bulk Verify Panel:** A panel that allows the HQ meteorologist to apply verification to multiple stations or centres simultaneously. The panel shows checkboxes for all pending stations; the user selects those to verify and clicks the Bulk Verify button.

### **Verification Status Indicators**

| Indicator | Meaning |
|---|---|
| Updated (not verified) | Data submitted by MC but not yet reviewed by HQ |
| Verified | Data reviewed and confirmed as valid by HQ |
| Pending | No data submitted for this station and date |
| Not Verified | Data exists but HQ has explicitly left it unverified (flagged for review) |

### **Verification Timestamp and Audit**

Each verification action is logged with: the station code, the date of the data being verified, the HQ user's username, and the verification timestamp. This audit record is preserved in the `data_actions` table and is accessible through the Log Info section. In the event of any data quality dispute, this audit trail provides documentary evidence of when the data was verified and by whom.

---

## **Module XIV: Verification MC — Detailed Reference**

### **Interface Layout**

The Verification MC section provides a simplified, centre-scoped view of the same verification process available in Verification HQ. The interface is divided into:

**Summary Counter Row:** Four count cards at the top of the page:
- **Updated:** Number of stations that have submitted data for today.
- **Pending:** Number of assigned stations that have not yet submitted data.
- **Verified:** Number of stations whose data has been verified by HQ.
- **Not Verified:** Number of stations whose data exists but has not yet been verified by HQ.

**Station Detail Table:** A table listing each station assigned to the centre with its daily rainfall value, submission timestamp, and current verification status (Verified / Pending HQ Review / Not Submitted). The verification status is read-only for MC users — they can see the verification outcome but cannot initiate or modify it.

**Date Selector:** Allows review of the previous day's or earlier submission status. The default view shows the current date.

### **Operational Use for MC Staff**

MC staff use the Verification MC section primarily for three purposes:

1. **Morning Check:** After completing data entry, the MC operator reviews the Verification MC screen to confirm that all submitted entries are showing as "Updated" rather than remaining in "Pending" status. This confirms that the save operation completed successfully for all stations.

2. **Feedback from HQ:** When HQ identifies issues with submitted data — for example, a value that appears inconsistent with surrounding stations — HQ may leave the station in "Not Verified" status. The MC operator reviews the Not Verified stations and contacts HQ to clarify or submit a correction.

3. **Coverage Monitoring:** The Pending count in the summary row helps centre supervisors track how many of their assigned stations have not yet submitted data. When this number remains high mid-morning, the supervisor contacts the data entry operators to identify any stations experiencing submission difficulties.

---

## **Module XV: Station Statistics — Detailed Reference**

### **Map View Controls**

The Station Statistics map provides the following controls:

- **Administrative Filter:** Restricts visible station markers to those within the selected region, state, or district. Multiple administrative levels can be combined.
- **Rainfall Intensity Filter:** Filters station markers to show only those in a specified intensity category (e.g., show only stations with Heavy or Very Heavy rainfall).
- **Date Selector:** Selects the date for which station rainfall values are displayed as marker colours and popup values.
- **Nearby Stations Radius Slider:** Sets the search radius (1–500 km) for the Nearby Station Comparison tool.
- **Polygon Selection Tool:** Activates the leaflet-draw polygon drawing tool. After drawing a polygon on the map, the system automatically filters the station table and statistics panel to show only stations whose coordinates fall within the drawn polygon boundary.

### **Station Popup Reference**

Clicking on a station marker shows a popup with:
- Station Name and Code
- Station Type (ORG / ARG / AWS)
- Latitude and Longitude
- Today's Rainfall (mm)
- Normal Rainfall for today (mm)
- Departure from Normal (%)
- Departure Category
- A link to the 30-day trend graph for this station

### **30-Day Trend Graph**

The 30-day trend graph for a selected station shows:

- **Bar series:** Daily rainfall (mm) for the 30 days preceding the selected date.
- **Line series:** Daily normal rainfall (mm) for the same 30-day window.
- **Cumulative overlay (optional):** Running sum of actual and normal over the 30 days, activated by the Cumulative toggle button.

The trend graph helps identify whether the station is exhibiting a persistent pattern (consistently below normal for several weeks, indicating a sustained deficit) or a transient pattern (normal conditions punctuated by a single heavy-rain event).

### **Nearby Station Comparison**

The Nearby Station Comparison tool uses the Haversine formula to compute the great-circle distance from the selected station to every other active station in the database. It returns a table of all stations within the specified radius, sorted by distance, showing: Station Name, Distance (km), Today's Rainfall, Normal Rainfall, and Departure Category.

This tool is particularly useful for:
- Validating an unusual reading at one station by comparing it with its neighbours.
- Identifying isolated pockets of heavy rainfall that may not be apparent at the subdivision or district level.
- Supporting media queries about the "nearest station" to a specific location.

---

## **Module XVI: Yearly Station Statistics — Detailed Reference**

### **Output Format Reference**

The Yearly Station Statistics section exports data in a station × date pivot matrix format. In the exported Excel file:

- **Row 1–5:** Header rows containing the report title, generation date, date range, and column headers.
- **Row 6 onward:** One row per station, with columns for: Station Code, Station Name, State, District, Subdivision, and then one column per date in the selected range.
- **Date columns:** Named in DD-MMM-YYYY format (e.g., "01-Jun-2024"). Each cell contains the rainfall in mm for that station on that date, or "ND" if no data was submitted.

For a full monsoon season (June–September = 122 days), the exported file has 122 date columns plus the 5 metadata columns, for a total of 127 columns. For a large district or state covering several hundred stations, the file may contain several hundred rows. This is within standard Excel limits but may cause slow rendering in older spreadsheet software.

### **Use Cases**

**Climate Analysis:** The full station × date matrix is the primary input for station-level climatological analysis. Researchers compute annual totals, seasonal totals, rain-day counts, onset dates, longest dry spells, and other climatological metrics from this matrix using standard statistical software (R, Python, Excel).

**Missing Data Assessment:** The matrix clearly shows which stations and which dates have "ND" (no data) values, allowing data completeness assessments to be made systematically. A station with many consecutive "ND" entries may have been inactive, experiencing communication failure, or temporarily decommissioned.

**Archive Preparation:** At the end of each year, the Yearly Station Statistics section is used to export the full year's station data for archival submission to IMD's climate data management system. The exported Excel file serves as the iRAINS contribution to the national rainfall archive.

---

## **Module XVII: Log Info — Detailed Reference**

### **Log Categories Reference**

The Log Info section organizes audit records into the following categories:

**Station Change Log:** Records all additions, edits, and deletions of station metadata. Each record includes: Action Type (Add / Edit / Delete), Station Code, Station Name, Changed Fields (for Edit actions), Old Values, New Values, Timestamp, and Responsible User. This log provides the complete history of changes to the station network configuration.

**Data Actions Log:** Records all data entry operations: single-record saves from the inline entry table, bulk upload completions, and data corrections. Each record includes: Action Type (Insert / Update / BulkUpload), Station Code, Date, Old Value (for updates), New Value, Timestamp, and User. This is the primary log for investigating data quality issues — if a previously correct value was changed incorrectly, the Data Actions log identifies when, what was changed, and by whom.

**User Action Log:** Records all login events and significant user actions such as verification operations, bulk verification events, report generation, and email dissemination sends. Each record includes: Action Type, Username, Timestamp, and relevant parameters (e.g., the verification date, the report type generated, or the recipient group for a dissemination send).

### **Filter and Search Controls**

The Log Info section provides the following filters:

- **Date Range Filter:** Returns log entries within the specified start and end dates.
- **Action Type Filter:** Restricts to a specific action type (Add, Edit, Delete, Insert, Update, BulkUpload, Login, Verify, etc.).
- **User Filter:** Restricts to log entries attributed to a specific username.
- **Station Code Filter:** Restricts the Station Change and Data Actions logs to entries for a specific station code.

Multiple filters can be combined. The filtered results can be downloaded as an Excel file for further analysis or archival.

### **Operational Use Cases**

**Investigating a Suspicious Value:** If a user notices an unexpectedly high or low rainfall value for a specific station and date, they open the Data Actions Log, filter by the station code and date, and review whether any corrections were applied to that record. If a correction is found, the log shows the old and new values and identifies the user who made the change.

**Auditing Station Network Changes:** Before and after any planned station network reconfiguration, the HQ administrator reviews the Station Change Log to confirm that all intended changes were applied correctly and that no unintended changes occurred.

**Security Review:** The User Action Log is reviewed periodically to verify that all login and verification activity corresponds to expected users operating within their assigned role. Unexpected login events — particularly outside business hours or from unusual access patterns — are investigated promptly.

---

## **Module XVIII: Dissemination — Detailed Reference**

### **Email Composition Interface**

The Dissemination section's composition panel contains:

- **To (Recipient Group):** A dropdown populated from the email group management table. Each group is a named list of email addresses. Users select one or more groups as recipients. Individual ad-hoc email addresses can also be added.
- **Subject:** A text field for the email subject line. Standard subject templates may be configured by the administrator.
- **Body:** A rich text editor for the email body. Supports basic formatting (bold, bullets, paragraph spacing).
- **Attachments:** A file selection panel showing available attachments from the system — generated PDFs, exported Excel files, downloaded map images. Users select which items to attach. Attachments already in the system are available without additional upload; users may also upload external files.
- **Send Button:** Dispatches the email via the configured SMTP server.

### **Recipient Group Management**

Recipient groups are maintained in the `email_group` table by the HQ administrator. Each group has:
- A group name (e.g., "State DMAs — North India", "IMD Internal — Hydromet")
- A list of email addresses belonging to the group
- A description of the group's purpose

Groups are updated by the HQ administrator as personnel changes occur. All changes are logged for audit purposes.

### **Email Log Reference**

The Email Log table records every sent email with:

| Field | Content |
|---|---|
| Log ID | Sequential identifier |
| Timestamp | Date and time the email was sent |
| Sender | Username of the iRAINS user who sent the email |
| Recipient Group | Name of the selected recipient group |
| Recipient Count | Number of addresses the email was sent to |
| Subject | Email subject line |
| Attachment List | Names of all files attached to the email |
| Status | Sent / Failed (with error description if failed) |

Users can filter the log by date range and export the log as Excel for reporting and audit purposes.

### **Auto-Dissemination Features**

The Dissemination section supports automated scheduled email dispatch for specific report types. When configured, the system automatically generates the specified report (e.g., the daily subdivision-wise PDF report), attaches it, and sends it to the designated recipient group at the configured time each day. The automation configuration is managed by the HQ administrator through the application's configuration interface. All auto-dispatched emails are logged in the Email Log with "Auto" indicated in the sender field.

---

# ***iRAINS Operational Workflows*** {#operational-workflows .unnumbered}

This section describes the end-to-end operational workflows through which iRAINS is used in day-to-day meteorological operations at IMD. Each workflow traces the actions taken by different user roles across the system's modules, from initial data collection to final dissemination. Understanding these workflows is essential for operational staff, system administrators, and new users orienting themselves to the platform.

---

## **Workflow 1: Daily Rainfall Data Entry and Verification**

The Daily Rainfall Data Entry and Verification workflow is the most fundamental operational process within iRAINS. It governs how rainfall observations collected each day at hundreds of meteorological stations across India are entered, reviewed, and confirmed as verified records.

**Participating Roles:** MC Users, RMC Users, HQ Users

**Frequency:** Daily, typically between 06:00 and 10:00 IST (corresponding to the 00 UTC observation cycle)

---

**Step 1: Station Rainfall Entry by MC / RMC**

Each morning, staff at Meteorological Centres and Regional Meteorological Centres log into iRAINS and navigate to the **Data Entry** section. The station filter panel is used to identify the specific stations assigned to that centre. Stations are typically organized by State, District, and Block, and the centre's assignment is automatically enforced by the system — MC users can only view and edit stations belonging to their own centre.

For each station, the user enters the daily rainfall observation in millimetres. Readings are entered directly in the inline data entry table. The table displays the last few days' data alongside the current entry field, enabling users to verify data continuity and identify obvious anomalies before submission.

If a station recorded no measurable rainfall, the value is entered as zero (0). If no observation was collected at all — due to instrument malfunction, communication failure, or the station being temporarily offline — the field is left blank or entered as the system's no-data sentinel value (−999.9 in the underlying data model), which the interface presents as "ND" (No Data).

After entering values, the user clicks the **Save** button. The system validates the entries: values below zero (other than the sentinel) are rejected with a validation error. The accepted values are written to the `station_daily_data_updates` table using an upsert operation, meaning that if data for the same station and date already exists, it is updated rather than duplicated.

**Step 2: Bulk Data Upload (Optional)**

For centres managing a large number of stations, or where data is initially collected in spreadsheet format, the **Bulk Upload** feature provides an efficient alternative to inline entry. The user downloads the provided Excel template, which contains pre-filled station codes and names for their assigned stations. Observed rainfall values are entered in the template, and the file is then uploaded via the drag-and-drop or file-browse interface in the Bulk Upload panel.

The backend parses the uploaded file, maps each row to its station code, validates the values, and performs an upsert for each valid row. Rows with invalid values (non-numeric, out-of-range, or unrecognised station codes) are flagged in the error summary returned after processing. Successful rows are confirmed, and the data becomes immediately available for retrieval by other modules.

**Step 3: Coverage and Completeness Check**

After data entry, users — particularly those at HQ and senior MC staff — navigate to the **Verification HQ** or **Verification MC** section to assess how many stations have been updated and how many remain pending. The Verification HQ section presents a national table showing the number of stations updated, pending, verified, and not yet reported for each MC and RMC centre. This overview helps the HQ meteorologist identify centres with low submission rates and follow up with the responsible personnel.

The top-of-page summary counters (Updated / Pending / Verified / Not Verified) provide an at-a-glance status. The date selector allows HQ staff to review submission completeness for any prior date, supporting retrospective monitoring.

**Step 4: Data Verification by HQ**

Once MC and RMC users have entered their data, the HQ meteorologist proceeds to verification. In the **Verification HQ** section, the station table lists individual stations with their submitted rainfall values, submission timestamps, and current verification status. The HQ user reviews the data, checking for obvious outliers, missing entries from stations expected to be active, and any values flagged by the data quality filters.

For stations that pass review, the user clicks the **Verify** button. Bulk verification allows multiple stations to be confirmed simultaneously by selecting checkboxes and clicking **Bulk Verify**. The system records the verification action by setting the `is_verified` flag to true and storing the verification timestamp and the HQ user's identifier.

Stations whose data appears questionable may be held unverified, pending follow-up with the originating centre. If an entry is discovered to be incorrect, the HQ user can coordinate with the MC to correct the value, after which the record is re-verified.

**Step 5: Downstream Effect on Visualisation Modules**

Once data is entered and verified, it becomes available to all calculation and visualisation modules across iRAINS. The Rainfall Map, Dashboard, Rainfall Statistics, and other sections automatically reflect the latest verified data when users load or refresh those sections. No manual re-calculation is required — the aggregation pipeline executes on-demand at query time, ensuring that visualisation modules always display the most current available data.

---

## **Workflow 2: Rainfall Monitoring and Departure Assessment**

This workflow describes how meteorologists at HQ, MC, and RMC level use iRAINS to perform daily rainfall monitoring — examining the current rainfall pattern, identifying anomalies, and assessing deviations from climatological normals.

**Participating Roles:** HQ, MC, RMC, SP Users

**Frequency:** Daily, after morning data entry is complete

---

**Step 1: Dashboard Overview**

The morning monitoring session typically begins at the **Dashboard**, where the user is presented with a real-time national overview of rainfall conditions. The choropleth map displays the departure from normal at Subdivision or State level using colour coding that instantly communicates which regions are experiencing excess, normal, or deficient rainfall. The statistics panel alongside the map provides numerical summaries — national actual versus normal, the departure percentage for the day, and the breakdown of subdivisions by departure category.

The scrolling marquee at the top of the Dashboard highlights the five highest-rainfall stations recorded in the last 24 hours, drawing immediate attention to significant rainfall events. If a station or region is showing an extreme value, the meteorologist notes it for further investigation in the Significant Rainfall module.

**Step 2: Rainfall Map Exploration**

After the initial Dashboard review, the user navigates to the **Rainfall Map** section for more detailed spatial analysis. By selecting different geographic levels — switching from Subdivision to District, or from Pan-India to a specific regional zone — the meteorologist can drill down into the spatial rainfall pattern with progressively finer resolution.

For any date of concern, the departure map is the most analytically useful view: areas coloured blue or light blue (excess or large excess) indicate regions where rainfall significantly exceeded the normal, while areas in yellow or red (deficient or large deficient) highlight rain shadow zones or areas under suppressed monsoon circulation. The block-level map, accessible for the finest spatial granularity, provides sub-district resolution to identify pockets of intense rainfall associated with localised systems.

**Step 3: Temporal Pattern Assessment with Rainfall Graphs**

To place the current day's rainfall in seasonal context, the user switches to the **Rainfall Graphs** section. Selecting the appropriate season (Monsoon, Pre-Monsoon, Winter, Post-Monsoon) and homogeneous region (Central India, South Peninsula, etc.), the user views the seasonal progression of daily rainfall compared to the normal. The cumulative graph toggle is particularly useful: a cumulative actual curve that tracks above the cumulative normal curve indicates a surplus monsoon season; a curve that consistently runs below indicates a deficit season.

This temporal perspective helps the meteorologist determine whether the current day's conditions reflect a persistent trend or an isolated event, which is crucial for forecast guidance and official bulletin preparation.

**Step 4: Departure Table Analysis**

The **Rainfall Departures** section provides the most structured view of departure patterns. The user selects the active season and year to display the full weekly departure matrix, with one row per subdivision and one column per week. Colour coding enables the meteorologist to trace the temporal evolution of rainfall patterns — identifying which subdivisions have been consistently deficient over multiple weeks, and which experienced an abrupt improvement following a monsoon advance or a cyclonic system's passage.

The cumulative departure view in the same section provides an aggregated perspective, showing total departure from season onset to date for each subdivision. This is the most direct indicator of overall monsoon performance for the current season.

**Step 5: Categorisation with Rainfall Statistics**

For formal monitoring bulletins and internal assessments, the **Rainfall Statistics** section provides a structured tabular output. The user selects the current date and the appropriate geographic level to generate a table showing each unit's actual, normal, and departure values alongside the assigned departure category. This table can be exported to PDF for inclusion in the daily bulletin or to Excel for use in archival records and further analysis.

---

## **Workflow 3: Monsoon Season Monitoring**

The Monsoon Season Monitoring workflow describes specialised operational activities carried out during the active monsoon season (June 1 to September 30), with a focus on modules specifically designed to characterise monsoon behaviour — the Spatial Distribution and Monsoon Activity sections.

**Participating Roles:** HQ Operational Meteorologists, SP (State and Sub-district Planners)

**Frequency:** Daily during the monsoon season; may also be applied during post-monsoon for northeast monsoon monitoring

---

**Step 1: Spatial Distribution Assessment**

The meteorologist begins with the **Spatial Distribution** section. By selecting the Subdivision level and the current date, the system calculates the percentage of rain-reporting stations in each subdivision and classifies the result into one of four categories: Isolated (≤25%), Scattered (>25–50%), Fairly Widespread (>50–75%), or Widespread (>75%). The colour-coded map provides an immediate picture of monsoon coverage across India.

During the monsoon onset, the spatial distribution map is one of the primary diagnostics used to determine whether conditions satisfy the rainfall criterion for onset declaration. When a large block of subdivisions transitions from Scattered to Fairly Widespread or Widespread coverage simultaneously, it often marks the advancing monsoon front. The user downloads both the map image and the tabular classification summary for inclusion in operational records.

**Step 2: Monsoon Activity Classification**

After the spatial distribution review, the user navigates to the **Monsoon Activity** section. This module performs the most complex classification in iRAINS, combining the rainfall ratio R (Actual ÷ Normal), the spatial coverage percentage, and counts of stations recording heavy rainfall (>30 mm, >50 mm, and >80 mm) to classify each subdivision or district into one of five activity categories: Weak, Normal, Active, Vigorous, or Subdued.

The classification distinguishes between Southwest Monsoon and Northeast Monsoon seasons. During the Southwest Monsoon (June–September), additional conditions on heavy-rain station counts and spatial coverage are applied before classifying a subdivision as Active or Vigorous, reflecting the higher-intensity characteristics of the Southwest Monsoon. The Northeast Monsoon (October–December), in contrast, is classified primarily on the rainfall ratio criterion alone.

The Subdued classification is applied when the rainfall ratio is below 1.0 and the area was classified as Isolated or Scattered on both the current day and the previous day — a two-consecutive-day criterion that prevents a single dry day from triggering a suppressed monsoon classification.

**Step 3: Combined Narrative Preparation**

Using the outputs of both the Spatial Distribution and Monsoon Activity sections, along with the departure maps from the Rainfall Map section, the HQ operational meteorologist has the quantitative basis to compose the daily monsoon monitoring narrative. This narrative describes the overall monsoon character (active, subdued, break), highlights regions of significant rainfall, and provides context for the public and media forecasting products issued each day.

**Step 4: Significant Rainfall Identification**

The **Significant Rainfall** section serves as the operational tool for identifying stations that exceeded specified heavy-rainfall thresholds. The meteorologist sets the threshold (commonly 64.5 mm for heavy rainfall, 115.6 mm for very heavy rainfall, or 204.4 mm for extremely heavy rainfall) and selects the date and region. The system returns all stations where the daily rainfall met or exceeded the threshold.

This list is used to verify reports of flooding, identify areas likely to experience waterlogging or river level rises, and prepare district-specific advisories. The results are exported to Excel or PDF for reference and coordination with the Flood Meteorological Offices.

---

## **Workflow 4: QPF Forecast Verification Review**

The QPF Forecast Verification workflow describes how forecasters and quality-assessment personnel use iRAINS to review historical forecast performance. This workflow is primarily analytical and reference-oriented, used periodically rather than daily.

**Participating Roles:** HQ Forecasters, Scientific Staff, Assessment Teams

**Frequency:** Monthly or as required for operational review and research

---

**Step 1: Accessing the Verification Archive**

The user navigates to the **QPF Verification Report** section. Available years are displayed as tabs — currently 2020, 2021, and 2022. The user selects the relevant year.

**Step 2: Document Review**

The embedded PDF viewer loads the selected year's QPF Verification Report. The report contains tables and charts prepared by Flood Meteorological Offices (FMOs) and the Damodar Valley Corporation (DVC), documenting comparisons between forecasted and observed rainfall at catchment and station level. Verification scores — typically expressed using standard objective verification metrics — allow forecasters to assess the accuracy of quantitative rainfall forecasts issued during the monsoon season.

**Step 3: Comparative Assessment**

Forecasters studying the verification report compare performance across seasons and catchments. Sections of the document showing consistent over-forecast or under-forecast biases can guide adjustments to forecast methodologies or the integration of new NWP guidance. The verified reports are also used as supporting material for training programmes, interdepartmental review meetings, and annual performance assessments.

**Step 4: Cross-reference with NWP Products**

Users may navigate between the QPF Verification Report and the **NWP Rainfall Products** section to compare the documented forecast performance with the output of specific models. The NWP Products section shows current and recent forecast maps from WRF ARW, IMD GFS, IMD GFS-BC, NCUM, NCUM-R, GEFS, and NEPS models. Reviewing forecast performance in the context of the NWP model outputs that drove those forecasts deepens the analytical value of the verification exercise.

---

## **Workflow 5: Report Generation and Official Dissemination**

This workflow describes how iRAINS supports the preparation and distribution of official rainfall-related reports and communications to internal and external stakeholders.

**Participating Roles:** HQ Operational Meteorologists, MC Users, Dissemination Staff

**Frequency:** Daily, weekly, and on-demand

---

**Step 1: Select Report Type and Parameters**

The user navigates to the **Rainfall Reports** section to generate a structured PDF report for a specified period. This could be for the previous day's rainfall, the previous week, the current season to date, or any user-specified date range. The user selects the date range and the geographic level (District, State, Subdivision, Region, or Country) and clicks View to trigger server-side report generation.

**Step 2: Review and Verify the Generated Report**

The generated PDF appears inline in the browser. The user scrolls through the report to verify that the data appears complete and consistent. If any discrepancies are noted — such as missing values for active states, or unusual departure values — the user may return to the Data Entry or Verification sections to investigate data completeness before regenerating the report.

**Step 3: Download the Report**

Once satisfied with the report content, the user downloads the PDF. Reports are named with the geographic level, a country/region identifier, and the generation timestamp, ensuring traceability of which version of the report was used for any given purpose.

**Step 4: Prepare Dissemination Package**

Using the downloaded rainfall reports, maps from the Rainfall Map section, and charts exported from the Rainfall Graphs or Spatial Distribution sections, the user assembles the complete dissemination package. This may include:

- The daily district-wise or subdivision-wise PDF rainfall report
- A departure map image showing the current week's or cumulative season's pattern
- A Monsoon Activity classification map
- A Spatial Distribution classification map

**Step 5: Send via the Dissemination Module**

With the dissemination package assembled, the user navigates to the **Dissemination** section. The recipient group management panel allows selection of pre-configured distribution lists — which may include other IMD offices, state disaster management authorities, media contacts, or government agencies. The user selects the relevant attachments (reports, maps, Excel files) from the available options, composes or selects a standard subject line and body text for the email, and clicks Send.

The system dispatches the email using the configured SMTP server (powered by Nodemailer), attaches the selected files, and logs the sent communication with a timestamp, sender identifier, recipient group, and list of attachments. The Email Log in the Dissemination section provides a permanent audit trail of all outgoing communications.

**Step 6: Automated Reminder Emails**

For pending data entry and verification, the system also supports automated reminder emails triggered by scheduled server-side tasks. These reminders are sent automatically to MC and RMC centres that have not yet submitted their daily data or completed verification, helping ensure timely data completeness without requiring manual follow-up by HQ staff.

---

## **Workflow 6: Station Management and Data Quality Control**

This workflow describes the administrative activities performed by HQ users to maintain the accuracy and reliability of the station network within iRAINS — including adding new stations, updating station metadata, excluding problematic records, and reviewing audit logs.

**Participating Roles:** HQ Administrators

**Frequency:** As required — typically when stations are commissioned, decommissioned, relocated, or when data quality issues are identified

---

**Step 1: Adding New Stations**

When a new meteorological station is established and ready for data entry in iRAINS, the HQ administrator navigates to the **Data Entry** section's Station Management panel. Using the Add Station form, the administrator enters the station's full metadata: the hierarchical 13-digit station code (encoding Region, Subdivision, State, District, Block, and Station serial within Block), station name, geographic coordinates (latitude and longitude), station type (AWS, ORG, or ARG), elevation, and the associated Meteorological Centre code that will be responsible for data entry.

The new station record is saved to the `station_details` table. After saving, the station becomes visible in the Data Entry section for the assigned MC and can receive daily rainfall data.

**Step 2: Editing Station Metadata**

If a station's details require correction or update — for example, if coordinates were recorded incorrectly, if the station type changes from ORG to AWS following an instrument upgrade, or if the station is temporarily reassigned to a different centre — the HQ administrator uses the Edit Station function. The relevant station is located through the administrative filter, the required fields are updated, and the change is saved.

All station metadata changes are automatically recorded in the `station_logs` audit table, capturing the change type (modification), the previous and new values, the timestamp, and the HQ user identifier who made the change. This audit trail is visible in the **Log Info** section.

**Step 3: Deactivating or Removing Stations**

When a station is permanently decommissioned, the HQ administrator marks the station as inactive or removes it from the active station list using the Delete function in Station Management. The deletion event is logged in the `deletedstationlog` table with the full station details, the deletion timestamp, and the responsible user, preserving a permanent record even after the station is no longer active.

**Step 4: Data Quality Exclusions**

When a station, block, or district is identified as producing systematically unreliable data — due to a faulty sensor, observer error pattern, or administrative anomaly — the HQ administrator can flag that entity in the `calculation_exclusions` table. Excluded entities are filtered out of all aggregation calculations until the exclusion is lifted, preventing contaminated readings from distorting district, subdivision, state, or regional rainfall averages.

**Step 5: Reviewing the Audit Log**

The **Log Info** section provides a comprehensive audit log of all significant system events. The HQ administrator regularly reviews:

- **Station Change Log:** Additions, edits, and deletions of station records.
- **Data Actions Log:** Records of bulk uploads, single-record saves, and corrections.
- **User Action Log:** Login events, verification actions, and configuration changes.

Filters by date range, action type, and user allow targeted investigation of specific events. If discrepancies are identified — such as an unexpected station deletion or an unusually large number of data corrections from a specific centre on a given date — the administrator can investigate the source and take corrective action.

**Step 6: Station Statistics Review**

After metadata changes or following quality control investigations, the administrator may navigate to the **Station Statistics** section to verify that the affected station is displaying correct data. The interactive map shows the station's location, the 30-day trend graph provides a time-series view of its recent reporting pattern, and the nearby station comparison tool allows comparison with adjacent stations to validate that readings are consistent with surrounding observations.

---

## **Workflow 7: Seasonal and Annual Rainfall Assessment**

This workflow describes how iRAINS is used for periodic in-depth assessments of rainfall performance over multi-week and multi-month periods — activities conducted at season end, year end, and for climate monitoring purposes.

**Participating Roles:** HQ Scientific Staff, Climate Analysis Teams, Senior Forecasters

**Frequency:** Monthly, at season end, at year end, and as required for climate bulletins and research

---

**Step 1: Seasonal Departure Review**

At the end of each meteorological season, the HQ scientific team opens the **Rainfall Departures** section and selects the completed season and year. The full weekly departure matrix for all subdivisions is reviewed to identify which areas experienced persistent deficit or surplus conditions. Subdivisions classified as Deficient or Large Deficient for five or more consecutive weeks are noted as candidates for meteorological drought declaration or monitoring.

The cumulative departure table provides the season-total departure percentage for each subdivision — a summary of overall season performance relative to the Long Period Average. These values form the core of the seasonal monsoon performance assessment published by IMD at the end of each monsoon season.

**Step 2: Annual District-Level Analysis with Yearly Station Statistics**

For fine-grained analysis at the station level, the **Yearly Station Statistics** section is used. The user selects the administrative filter for the region or state under study and a date range spanning the full season or year. The system generates the station × date pivot matrix showing daily rainfall at every station for the period. This matrix is exported to Excel, providing a complete dataset for statistical processing, missing-data analysis, and annual archive preparation.

The pivoted format is particularly useful for climatological studies: researchers can compute annual totals, count rain-days, determine onset and withdrawal dates at individual stations, and compare year-to-year variability across the station network.

**Step 3: Comparative Historical Assessment with Rainfall Graphs**

The **Rainfall Graphs** section provides multi-year historical context. By selecting the same region and season for different years — for example, comparing the 2024 Monsoon against 2023 and 2022 — the scientific team can visualise how the current season's cumulative rainfall trajectory compares with recent historical seasons. The column chart shows day-by-day actual versus normal, and the cumulative toggle reveals whether the season as a whole was above or below the LPA.

**Step 4: Regional and National Summary Reports**

The **Rainfall Reports** section is used to generate official summary documents at the end of each month and season. Country-level, Region-level, and Subdivision-level PDF reports are generated and retained as archival documents. These reports serve as the primary official record of rainfall performance for the period.

**Step 5: Monsoon Activity Summary**

Using the **Monsoon Activity** section, the scientific team reviews the sequence of active, vigorous, normal, weak, and subdued monsoon days recorded during the season. This characterisation of intra-seasonal variability helps explain rainfall distribution patterns, departure anomalies, and extreme events captured in the other analysis products.

---

## **Workflow 8: Forecast Support using NWP Products**

This workflow describes how operational forecasters use the NWP Rainfall Products section in conjunction with observed rainfall data from other iRAINS modules to prepare and refine short-range and medium-range rainfall forecasts.

**Participating Roles:** HQ Operational Forecasters, MC Forecasters

**Frequency:** Daily, at NWP model run availability times (typically 00Z and 12Z)

---

**Step 1: Review Latest Model Outputs**

At the start of each morning forecast cycle, the forecaster navigates to the **NWP Rainfall Products** section. The model selector is used to cycle through the available models: WRF ARW, IMD GFS, IMD GFS-BC, NCUM, NCUM-R 00Z, NCUM-R 12Z, GEFS, and NEPS. For each model, forecast maps are available for lead times Day+1 through Day+7, showing the expected spatial distribution of quantitative precipitation over the forecast period.

The MC (Meteorological Centre) map view shows model rainfall fields organized by forecasting centre jurisdiction, enabling each centre's meteorologist to focus on their area of responsibility. The River Basin view provides forecast fields organized by river basin boundaries, which is the primary reference for the Flood Meteorological Offices.

**Step 2: Probabilistic Forecast Assessment**

For medium-range forecasts (Day+4 through Day+7), the GEFS and NEPS ensemble models provide probabilistic QPF products. The forecaster switches to the PQPF panel to review probability-of-exceedance maps for different rainfall thresholds. High probability values (>70%) for thresholds of 64.5 mm (heavy rainfall) or higher indicate a high-confidence forecast of significant rainfall, warranting consideration of impact-based forecasting products.

**Step 3: Validation Against Observed Data**

After reviewing the NWP forecast maps, the forecaster cross-references the model output against the most recent observations. Switching to the **Rainfall Map** section (Daily Actual), the forecaster compares the yesterday's observed rainfall distribution with the Day+1 forecast that was issued 24 hours prior. Areas where the model significantly over-forecast or under-forecast are noted as calibration guidance for the current day's forecast.

**Step 4: Significant Rainfall Forecast Guidance**

If the NWP products indicate concentrated heavy rainfall over a specific district or region in the near term, the forecaster uses the **Significant Rainfall** section to review the history of extreme events at those stations. Understanding whether an area is prone to heavy rainfall — or has recently been experiencing prolonged deficit conditions — provides the hydrological and meteorological context for issuing appropriate warnings.

**Step 5: Documentation and Handover**

Forecast decisions supported by the NWP product review are documented in the forecast duty register. Maps downloaded from the NWP Rainfall Products section may be attached to internal handover notes or included in the dissemination package prepared via the **Dissemination** section for transmission to state disaster management authorities and other stakeholders.

---

# ***Appendix A: iRAINS Database Schema Reference*** {#appendix-a .unnumbered}

This appendix provides a reference summary of the primary database tables used in iRAINS, including their purpose, key columns, and relationships. The database is hosted in **PostgreSQL**. Table names use the `public` schema unless otherwise noted.

---

## **A.1 Rainfall Observation Tables**

### `station_daily_data_updates`

**Purpose:** The primary operational table storing daily rainfall observations entered by MC/RMC users and validated by HQ. This is the source of truth for actual rainfall values used in all aggregation, departure, and reporting calculations.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| station_id | NUMERIC | Station code (foreign key to station_details) |
| district_code | NUMERIC(8) | 8-digit district code |
| collection_date | DATE | The date for which the observation applies |
| data | NUMERIC | Rainfall value in mm; −999.9 = No Data |
| is_verified | INTEGER | 0 = not verified; 1 = verified by HQ |
| verified_at | TIMESTAMP | Timestamp when verification was performed |
| verified_by | INTEGER | User ID of the verifying officer |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last-modified timestamp |

**Constraints:** Unique composite key on `(station_id, collection_date)` — enforces one record per station per day. All writes use `ON CONFLICT DO UPDATE` (upsert).

---

### `station_details`

**Purpose:** The master station registry. Every rainfall observation station in the iRAINS network is registered here. This table is the authoritative source for station identity, geographic location, centre assignment, and instrumentation type.

| Column | Data Type | Description |
|---|---|---|
| station_id | NUMERIC | Unique 13-digit hierarchical station code |
| station_name | TEXT | Official station name |
| district_code | NUMERIC(8) | 8-digit district code (geographical hierarchy) |
| centre_type | TEXT | "MC" or "RMC" |
| centre_name | TEXT | Name of the assigned Meteorological Centre |
| station_type | TEXT | "AWS", "ORG", or "ARG" |
| new_or_old | TEXT | "NEW" or "OLD" |
| latitude | NUMERIC | Station latitude in decimal degrees |
| longitude | NUMERIC | Station longitude in decimal degrees |
| year_of_activation | DATE | Date the station was commissioned |
| is_active | BOOLEAN | Whether the station is currently active |

**Station Code Structure:** The 13-digit station code encodes the full geographic hierarchy: Region (1 digit) + Subdivision (3 digits) + State (5 digits) + District (8 digits) + Block (10 digits) + Station (13 digits).

---

## **A.2 Normal Rainfall Reference Tables**

The normal rainfall reference tables store pre-calculated daily climatological baseline values for each geographic unit. These values represent the long-period averages derived from historical records and are used as the denominator in all departure calculations.

### `normal_district`

**Purpose:** Daily normal rainfall reference values at district level.

| Column | Data Type | Description |
|---|---|---|
| district_code | NUMERIC(8) | 8-digit district code |
| date | DATE | Calendar date (one row per district per day of year) |
| rainfall_value | NUMERIC | Normal rainfall in mm for this district on this date |

---

### `normal_state`

**Purpose:** Daily normal rainfall reference values at state level.

| Column | Data Type | Description |
|---|---|---|
| state_code | NUMERIC | State identifier code |
| date | DATE | Calendar date |
| rainfall_value | NUMERIC | Normal rainfall in mm for this state on this date |

---

### `normal_sub_division`

**Purpose:** Daily normal rainfall reference values at meteorological subdivision level.

| Column | Data Type | Description |
|---|---|---|
| sub_division_code | NUMERIC | Subdivision identifier code |
| date | DATE | Calendar date |
| rainfall_value | NUMERIC | Normal rainfall in mm for this subdivision on this date |

---

### `normal_region`

**Purpose:** Daily normal rainfall reference values at homogeneous region level.

| Column | Data Type | Description |
|---|---|---|
| region_code | NUMERIC | Region identifier code |
| date | DATE | Calendar date |
| rainfall_value | NUMERIC | Normal rainfall in mm for this region on this date |

---

### `normal_country`

**Purpose:** Daily normal rainfall reference values for All India.

| Column | Data Type | Description |
|---|---|---|
| country_name | TEXT | "INDIA" |
| date | DATE | Calendar date |
| rainfall_value | NUMERIC | Normal rainfall in mm for All India on this date |

---

## **A.3 Geographic Metadata Tables**

### `normal_district_details`

**Purpose:** A critical geographic reference table linking each district to its parent geographic hierarchy and providing the area and weight values used in the aggregation pipeline. This table is joined in nearly every aggregation query.

| Column | Data Type | Description |
|---|---|---|
| district_code | NUMERIC(8) | 8-digit district code |
| district_name | TEXT | Official district name |
| state_code | NUMERIC | Parent state code |
| state_name | TEXT | Parent state name |
| sub_division_code | NUMERIC | Parent meteorological subdivision code |
| subdiv_name | TEXT | Parent subdivision name |
| region_code | NUMERIC | Parent homogeneous region code |
| region_name | TEXT | Parent region name |
| district_area | NUMERIC | Geographic area of the district in km² (used for area-weighted aggregation) |
| subdiv_weight | NUMERIC | Subdivision weighting factor used in region-level aggregation |

---

## **A.4 Audit and Log Tables**

### `station_logs`

**Purpose:** An immutable audit log of all station additions and deletions performed by HQ administrators.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| station_code | NUMERIC | Station code of the affected station |
| station_name | TEXT | Station name at time of log entry |
| district_code | NUMERIC(8) | District code of the station |
| log_date | TIMESTAMP | Timestamp of the action |
| userid | INTEGER | User ID of the administrator who performed the action |
| log_type | TEXT | "Added" or "Deleted" |

---

### `data_actions`

**Purpose:** Records user actions performed within the system on a per-day basis. Used by the Action Log in the Log Info section.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| employee_name | TEXT | Full name of the officer performing the action |
| loggedin_user | TEXT | System username of the officer |
| action | TEXT | Description of the action performed |
| updated_at | TIMESTAMP | Timestamp of the action |

---

### `deletedstationlog`

**Purpose:** A general activity log that records both station removal events and document/report upload events.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| stationname | TEXT | Station name or report name |
| stationid | TEXT | Station ID (if applicable) |
| datetime | TIMESTAMP | Timestamp of the event |
| username | TEXT | Username of the officer who triggered the event |
| type | TEXT | Event type (e.g., "Report Uploaded", "Station Deleted") |

---

## **A.5 Communication Tables**

### `email_log`

**Purpose:** A complete audit trail of all email send attempts made through the Dissemination module, including both successful deliveries and failures.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| email | TEXT | Recipient email address |
| subject | TEXT | Email subject line |
| message | TEXT | Email body text or HTML |
| datetime | TIMESTAMP | Timestamp when the send was attempted |
| status | BOOLEAN | true = Sent successfully; false = Send failed |

---

### `email_group`

**Purpose:** Stores named email distribution groups and their associated recipient addresses. Addresses are stored in JSONB format to allow flexible multi-recipient groups without a separate join table.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| groupname | TEXT | Unique name of the distribution group |
| emails | JSONB | JSON object: { "mails": ["addr1@x.com", "addr2@x.com", ...] } |

---

## **A.6 User Management Table**

### `login`

**Purpose:** Stores user account credentials and role assignments. Role (`mcorhq`) determines the access tier and centre-scoping for each logged-in session.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| username | TEXT | Login username |
| password | TEXT | Hashed password |
| name | TEXT | Full display name of the officer |
| mcorhq | TEXT | Role: "hq", "mc", "rmc", or "sp" |
| centre_name | TEXT | Assigned Meteorological Centre or RMC name |
| centre_type | TEXT | "MC", "RMC", or null (for HQ/SP) |

---

## **A.7 Calculation Control Table**

### `calculation_exclusions`

**Purpose:** Allows HQ administrators to exclude specific stations, blocks, or districts from the aggregation pipeline. This is used for stations that are temporarily non-operational, undergoing calibration, or reporting obviously erroneous values that cannot be corrected immediately.

| Column | Data Type | Description |
|---|---|---|
| id | SERIAL | Auto-incrementing primary key |
| exclusion_type | TEXT | Level of exclusion: "station", "block", or "district" |
| exclusion_code | NUMERIC | The code of the station, block, or district to exclude |
| reason | TEXT | Optional text reason for the exclusion |
| created_at | TIMESTAMP | Timestamp when the exclusion was created |
| created_by | INTEGER | User ID of the HQ administrator who created it |

---

# ***Appendix B: Complete API Endpoint Reference*** {#appendix-b .unnumbered}

This appendix provides a consolidated reference of all iRAINS backend API endpoints, organized by functional domain. All endpoints are prefixed with `/api/v1/` unless otherwise noted. All POST endpoints accept and return JSON. Authentication requires a valid JWT in the `Authorization: Bearer <token>` header.

---

## **B.1 Authentication**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/login | Authenticate user and receive JWT | { username, password } |
| POST | /api/v1/logout | Invalidate session | None (JWT required) |

---

## **B.2 Rainfall Data Retrieval**

| Method | Endpoint | Purpose | Request Body / Params |
|---|---|---|---|
| POST | /api/v1/fetchStationData | Fetch all stations with data and verification status for a date | { Date: "YYYY-MM-DD" } |
| POST | /api/v1/fetchStationDatanew | Fetch all stations with data for Significant Rainfall filtering | { Date: "YYYY-MM-DD" } |
| POST | /api/v1/fetchStationDataTemp | Fetch all stations with rainfall for Station Statistics map load | { date: "YYYY-MM-DD" } |
| POST | /api/v1/fetchInRangeStationdata | Fetch summed station rainfall for a date range | { fromDate, toDate } |
| POST | /api/v1/fetchStationDataInRadius | Fetch stations within a specified radius using Haversine formula | { Date, lat, long, range } |
| POST | /api/v1/fetchAllDatesAndDataOfStation | Retrieve full historical record for one station | { station_id } |
| POST | /api/v1/fetchStationWithMaxRainfall | Fetch top N stations by total rainfall in a period | { startDate, endDate, limit } |
| POST | /api/v1/fetchFilteredStationUnifiedFileFTP | Fetch IMD daily data filtered by district list | { fromDate, toDate, districtCodeList: [] } |
| POST | /api/v1/fetchStateAwsUnifiedFile | Fetch State AWS station data for a date range | { startDate, endDate } |

---

## **B.3 District, State, Subdivision, Region, Country Aggregation**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/getDistrictData | Get aggregated actual, normal, and departure for districts | { startDate, endDate } |
| POST | /api/v1/getStateData | Get aggregated state-level rainfall with area weighting | { startDate, endDate } |
| POST | /api/v1/getSubdivData | Get aggregated subdivision-level rainfall | { startDate, endDate } |
| POST | /api/v1/getRegionData | Get aggregated region-level rainfall with subdivision weights | { startDate, endDate } |
| POST | /api/v1/getCountryData | Get All-India aggregated rainfall | { startDate, endDate } |

---

## **B.4 PDF Report Generation**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/generateDistrictPDF | Generate district-level rainfall PDF | { startDate, endDate, action: "view"\|"download" } |
| POST | /api/v1/downloadDistrictPDF | Download district-level rainfall PDF | { startDate, endDate } |
| POST | /api/v1/viewDistrictPDF | View district-level PDF inline | { startDate, endDate } |
| POST | /api/v1/generateCustomDatePDF | Generate district PDF for custom date range | { startDate, endDate, action } |
| POST | /api/v1/generateStatePDF | Generate state-level rainfall PDF | { startDate, endDate, action } |
| POST | /api/v1/downloadStatePDF | Download state-level PDF | { startDate, endDate } |
| POST | /api/v1/viewStatePDF | View state-level PDF inline | { startDate, endDate } |
| POST | /api/v1/generateSubdivPDF | Generate subdivision-level PDF | { startDate, endDate, action } |
| POST | /api/v1/downloadSubdivPDF | Download subdivision-level PDF | { startDate, endDate } |
| POST | /api/v1/generateRegionPDF | Generate region-level PDF | { startDate, endDate, action } |
| POST | /api/v1/downloadRegionPDF | Download region-level PDF | { startDate, endDate } |

---

## **B.5 Spatial Distribution**

| Method | Endpoint | Purpose | Request / Query Params |
|---|---|---|---|
| GET | /api/v1/getSpatialDistributionData | Subdivision-level spatial distribution | ?date= or ?startDate=&endDate= (&mode=daywise) |
| GET | /api/v1/getSpatialDistributionDataState | State-level spatial distribution | Same as above |

---

## **B.6 Monsoon Activity**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/monsoon-activity | Today's subdivision-level activity classification | { date: "YYYY-MM-DD" } |
| POST | /api/v1/monsoon-activity-district | Today's district-level activity classification | { date: "YYYY-MM-DD" } |
| POST | /api/v1/monsoon-activity-subdiv-last7 | 7-day activity trend at subdivision level | { date: "YYYY-MM-DD" } |
| POST | /api/v1/monsoon-activity-subdiv-last30 | 30-day activity trend at subdivision level | { date: "YYYY-MM-DD" } |
| POST | /api/v1/monsoon-activity-district-last7 | 7-day activity trend at district level | { date: "YYYY-MM-DD" } |
| POST | /api/v1/monsoon-activity-district-last30 | 30-day activity trend at district level | { date: "YYYY-MM-DD" } |

---

## **B.7 Data Entry and Station Management**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/updateStationData | Save or update a single station's rainfall value | { date, station_code, value } |
| POST | /api/v1/insertRainfallFile | Bulk upload rainfall observations from Excel | Excel file (multipart) |
| POST | /api/v1/addNewStation | Register a new station in the system | Station metadata fields |
| POST | /api/v1/editStation | Update an existing station's metadata | Station metadata fields |
| POST | /api/v1/deleteStation | Remove a station from the registry | { station_id } |
| POST | /api/v1/EditMultipleStations | Bulk update station metadata from Excel | Excel file (multipart) |

---

## **B.8 Verification**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /api/v1/verifyStationData | Verify a single station record | { userid, date, station_id } |
| POST | /api/v1/verifyMultipleStationData | Verify multiple stations in one operation | { userid, date, station_ids: [] } |
| POST | /api/v1/fetchCentreStationSummary | Cumulative verification summary per centre over a date range | { startDate, endDate } |

---

## **B.9 Log Info**

| Method | Endpoint | Purpose | Request / Params |
|---|---|---|---|
| GET | /api/v1/fetchStationLogs | Retrieve most recent 50 station change log entries | None |
| GET | /api/v1/deletedstationlog | Retrieve all general activity log entries | None |
| POST | /api/v1/dataActions | Retrieve action log entries for a specific date | { startDate: "YYYY-MM-DD" } |

---

## **B.10 Email Dissemination**

| Method | Endpoint | Purpose | Request Body |
|---|---|---|---|
| POST | /send-email | Send an email to one recipient | { to, subject, text, attachments: [] } |
| GET | /emailgroup | Retrieve all email distribution groups | None |
| POST | /emailgroup | Create a new distribution group | { groupName, emails: JSON string } |
| PUT | /email-dissemination/defined-email/:id | Update an existing group | { groupName, emails } |
| DELETE | /email-dissemination/defined-email | Delete a group | { data: id } |
| GET | /emaillog | Retrieve all email log entries | None |
| GET | /email-dissemination/email-log | Retrieve email log for a specific date | ?date=YYYY-MM-DD |

---

# ***Appendix C: Comprehensive User Role and Access Matrix*** {#appendix-c .unnumbered}

This appendix provides a consolidated view of the access privileges for each user role across all major iRAINS features and sub-sections.

**Role Definitions:**
- **HQ** — India Meteorological Department Headquarters, Mausam Bhawan. Full national access and administrative control.
- **MC** — Meteorological Centre. Operational access scoped to the user's assigned centre and its stations.
- **RMC** — Regional Meteorological Centre. Similar to MC with regional scope.
- **SP** — Special Permission. Read-only access to most visualization and analytical modules.
- **Guest** — Unauthenticated public user. View-only access to selected public-facing maps and reports.

---

**Table: iRAINS – Master User Role and Access Matrix**

| Module / Feature | HQ | MC | RMC | SP | Guest |
|---|---|---|---|---|---|
| **Rainfall Map** | | | | | |
| View all rainfall maps (actual, departure, normal) | Yes | Yes | Yes | Yes | Yes |
| Access all geographic levels (district to country) | Yes | Yes | Yes | Yes | Yes |
| Download maps and statistics reports | Yes | Yes | Yes | No | No |
| **iRAINS Dashboard** | | | | | |
| View national dashboard | Yes | Yes | Yes | Yes | Yes |
| Switch geographic levels on dashboard | Yes | Yes | Yes | Yes | Yes |
| Download dashboard maps and statistics | Yes | Yes | Yes | No | No |
| **Rainfall Graphs** | | | | | |
| View seasonal and regional charts | Yes | Yes | Yes | Yes | Yes |
| Download graphs as image or PDF | Yes | Yes | Yes | No | No |
| **NWP Rainfall Products** | | | | | |
| View NWP forecast maps (all models) | Yes | Yes | Yes | Yes | Yes |
| Download NWP forecast images | Yes | Yes | Yes | No | No |
| **Rainfall Statistics** | | | | | |
| View daily and cumulative statistics tables | Yes | Yes | Yes | Yes | Yes |
| Export statistics as PDF or Excel | Yes | Yes | Yes | No | No |
| **Rainfall Departures** | | | | | |
| View weekly and cumulative departure tables | Yes | Yes | Yes | Yes | Yes |
| Download departure PDF | Yes | Yes | Yes | No | No |
| **QPF Verification Report** | | | | | |
| View archived QPF verification PDFs | Yes | Yes | Yes | Yes | Yes |
| Download QPF verification PDF | Yes | Yes | Yes | Yes | Yes |
| **Rainfall Reports** | | | | | |
| Generate on-demand PDF reports for any date range | Yes | Yes | Yes | Yes | Yes |
| Download generated rainfall report PDF | Yes | Yes | Yes | Yes | Yes |
| **Spatial Distribution** | | | | | |
| View subdivision and state spatial distribution table | Yes | Yes | Yes | Yes | Yes |
| View Leaflet choropleth map | Yes | Yes | Yes | Yes | Yes |
| Download PDF (national scope) | Yes | No | No | No | No |
| Download PDF (own MC scope only) | Yes | Yes | Yes | No | No |
| Download Excel (statewise distribution) | Yes | Yes | Yes | No | No |
| **Monsoon Activity** | | | | | |
| View activity map and tabular summary | Yes | Yes | Yes | Yes | Yes |
| View historical trend charts (7-day, 30-day) | Yes | Yes | Yes | Yes | Yes |
| Download map (JPEG / PDF) | Yes | Yes | Yes | No | No |
| Download tabular PDF | Yes | Yes | Yes | No | No |
| **Data Entry** | | | | | |
| View station list with rainfall entry table | Yes | Yes (own) | Yes (own) | No | No |
| Enter and save rainfall values inline | Yes | Yes (own) | Yes (own) | No | No |
| Bulk upload rainfall from Excel | Yes | Yes | Yes | No | No |
| Add new station (Station Management) | Yes | No | No | No | No |
| Edit station metadata | Yes | No | No | No | No |
| Delete station | Yes | No | No | No | No |
| Bulk edit stations from Excel | Yes | No | No | No | No |
| **Significant Rainfall** | | | | | |
| View and filter significant rainfall data | Yes | Yes | Yes | Yes | No |
| Download Excel export | Yes | Yes | Yes | No | No |
| Download Summary of Weather PDF | Yes | Yes | Yes | No | No |
| **Verification HQ** | | | | | |
| View national verification summary (all MCs/RMCs) | Yes | No | No | No | No |
| Drill down into station detail by status | Yes | No | No | No | No |
| Verify selected or all stations | Yes | No | No | No | No |
| View cumulative range verification table | Yes | No | No | No | No |
| Download Daily / Cumulative Excel | Yes | No | No | No | No |
| **Verification MC** | | | | | |
| View own-centre verification dashboard | No | Yes | Yes | No | No |
| Enter missing data in Not Updated drill-down | No | Yes | Yes | No | No |
| Verify selected or all not-verified stations | No | Yes | Yes | No | No |
| **Station Statistics** | | | | | |
| View interactive map with colour-coded markers | Yes | Yes | Yes | Yes | No |
| Apply administrative filters | Yes | Yes (own) | Yes (own) | Limited | No |
| View 30-day trend chart for any station | Yes | Yes | Yes | Yes | No |
| Use radius comparison and polygon selection tools | Yes | Yes | Yes | No | No |
| Export charts (PNG, JPEG, PDF, SVG) | Yes | Yes | Yes | No | No |
| **Yearly Station Statistics** | | | | | |
| View IMD station pivot table | Yes | Yes (own) | Yes (own) | No | No |
| View State AWS pivot table | Yes | Yes | Yes | No | No |
| View Statistics split-panel with charts | Yes | Yes | Yes | No | No |
| Download styled Excel workbook | Yes | Yes | Yes | No | No |
| **Log Info** | | | | | |
| View Station Log (add/delete history) | Yes | Yes | Yes | No | No |
| View Reports Log (upload history) | Yes | Yes | Yes | No | No |
| View Action Log (user action by date) | Yes | Yes | Yes | No | No |
| **Dissemination** | | | | | |
| Compose and send email (manual or group) | Yes | Yes | Yes | No | No |
| Manage email distribution groups | Yes | Yes | Yes | No | No |
| View and filter Email Log | Yes | Yes | Yes | No | No |
| Bulk report auto-dissemination | Yes | No | No | No | No |
| Toggle Auto Email reminders | Yes | Yes | Yes | No | No |

---

# ***Appendix D: Glossary of Technical and Meteorological Terms*** {#appendix-d .unnumbered}

This glossary defines the key technical and meteorological terms used throughout this document.

---

**Active Monsoon**
A monsoon condition in which rainfall is 1.5 to 4 times the climatological normal value, accompanied by wind intensification. Occurs when the monsoon trough is positioned south of its climatological mean position.

**Angular 16**
A TypeScript-based open-source frontend web application framework developed by Google. Used as the primary frontend development framework for the iRAINS user interface.

**API (Application Programming Interface)**
A defined set of rules and protocols through which software components communicate. In iRAINS, the backend exposes a RESTful API consumed by the Angular frontend.

**ARG (Automatic Rain Gauge)**
A rainfall observation instrument that records precipitation electronically. ARG data is automatically transmitted to the data collection system without manual reading.

**Area-Weighted Average**
A method of computing a summary statistic for a geographic unit by weighting each sub-unit's value by the sub-unit's geographic area. Used in iRAINS for state and subdivision-level rainfall aggregation.

**AWS (Automatic Weather Station)**
A fully automated weather observation system that records multiple meteorological parameters (rainfall, temperature, wind, etc.) without human intervention and transmits data electronically.

**Block Level**
The finest administrative unit used in iRAINS rainfall analysis. India is divided into administrative blocks within districts. Block-level analysis provides the most granular spatial resolution available in the system.

**Choropleth Map**
A thematic map type in which geographic areas are shaded or coloured proportionally to a data value (such as rainfall departure). Used extensively in iRAINS Rainfall Map and other visualization sections.

**Climatological Normal / Long-Period Average (LPA)**
The rainfall value averaged over a long reference period (30–50 years) for a given location and time period. Used as the baseline against which actual rainfall is compared to compute departure. The current All-India SW monsoon LPA is 880.6 mm (1961–2010 reference period).

**CTE (Common Table Expression)**
A temporary named result set in a SQL query, defined using the `WITH` keyword. Used in iRAINS backend controllers for complex multi-step aggregation queries.

**Cumulative Rainfall**
The total rainfall accumulated from the start of a season or reference period to the current date. Displayed in iRAINS Rainfall Graphs, Rainfall Departures, and Rainfall Statistics sections.

**Deficient Rainfall**
A departure category indicating actual rainfall between 20% and 59% below normal. One of seven rainfall classification categories used in iRAINS.

**Departure from Normal**
The percentage deviation of actual rainfall from the climatological normal value. Formula: (Actual − Normal) ÷ Normal × 100. Positive values indicate excess rainfall; negative values indicate deficient rainfall.

**District**
An administrative subdivision of a state in India. iRAINS uses the 8-digit district code as the primary geographic identifier for district-level analysis.

**Dry Spell**
A period of little or no rainfall. Identified in iRAINS through the No Rain (NR) and Large Deficient (LD) departure categories.

**Excess Rainfall**
A departure category indicating actual rainfall between 20% and 59% above normal. Colour-coded light blue in iRAINS reports.

**Express.js**
A minimal and flexible Node.js web application framework that provides the HTTP routing infrastructure for the iRAINS backend.

**FMO (Flood Meteorological Office)**
A specialized office within IMD responsible for issuing flood-related meteorological forecasts and QPF (Quantitative Precipitation Forecasts). QPF verification reports in iRAINS archive performance assessments from FMOs.

**GeoJSON**
An open standard format for encoding geographic data structures using JSON. Used in iRAINS for storing and rendering India's state, subdivision, and district boundary polygons in Leaflet maps.

**Haversine Formula**
A trigonometric formula for calculating the great-circle distance between two points on a sphere (such as the Earth) given their latitudes and longitudes. Used in the Station Statistics section to find stations within a user-specified radius.

**Heavy Rainfall**
An IMD rainfall intensity category for daily observations between 64.5 mm and 115.5 mm. Represented by an orange marker in the Station Statistics map.

**HQ (Headquarters)**
India Meteorological Department Headquarters located at Mausam Bhawan, New Delhi. HQ users in iRAINS have national-scope administrative and verification privileges.

**Highcharts**
A JavaScript charting library supporting a wide range of chart types including line, bar, column, pie, and stacked charts. Used in iRAINS via the Angular-Highcharts wrapper for all analytical chart visualizations.

**HTML-to-Image**
A JavaScript library that renders a DOM element to a PNG or JPEG image at a configurable pixel ratio. Used in iRAINS to capture Leaflet map canvases for PDF export.

**IMD (India Meteorological Department)**
The national meteorological service of India, under the Ministry of Earth Sciences. IMD is responsible for meteorological observations, weather forecasting, and climatological analysis across India.

**iRAINS**
The IMD RAinfall INformation System. A centralized web-based platform developed by the IMD-RIMES Unit (IRU) for the Hydromet Division of IMD to support rainfall data management, analysis, visualization, and dissemination.

**IRU (IMD-RIMES Unit)**
The joint operational unit of the India Meteorological Department and the Regional Integrated Multi-Hazard Early Warning System (RIMES) organization that developed and maintains iRAINS.

**JWT (JSON Web Token)**
A compact, URL-safe means of representing claims to be transferred between parties. Used in iRAINS for user authentication and session management.

**Large Deficient Rainfall**
A departure category indicating actual rainfall between 60% and 99% below normal. Colour-coded yellow in iRAINS reports.

**Large Excess Rainfall**
A departure category indicating actual rainfall 60% or more above normal. Colour-coded blue in iRAINS reports.

**Leaflet.js**
An open-source JavaScript library for mobile-friendly interactive maps. Used in iRAINS for all map-based visualizations.

**leaflet-draw**
A Leaflet plugin providing interactive drawing tools (polygon, polyline, rectangle, circle) for user-defined geographic selections. Used in iRAINS Station Statistics for the polygon area selection tool.

**Light Rainfall**
An IMD rainfall intensity category for daily observations between 2.5 mm and 15.5 mm.

**LPA (Long Period Average)**
See Climatological Normal.

**MC (Meteorological Centre)**
A regional office of IMD responsible for meteorological observations and forecasting for a defined geographic area. MC users in iRAINS are responsible for entering and verifying data from stations under their centre.

**Moderate Rainfall**
An IMD rainfall intensity category for daily observations between 15.6 mm and 64.4 mm.

**Monsoon**
The seasonal wind reversal system affecting South Asia. The Southwest (SW) Monsoon (June–September) delivers the majority of India's annual rainfall. The Northeast (NE) Monsoon (October–December) affects primarily Tamil Nadu and adjacent areas.

**MJO (Madden-Julian Oscillation)**
A large-scale, eastward-propagating atmospheric phenomenon operating on 30–60 day cycles, significantly influencing active and break monsoon cycles.

**NE Monsoon (Northeast Monsoon)**
The post-Southwest-Monsoon rainfall season affecting primarily peninsular India (October–December). Active Monsoon criteria during NE Monsoon require only the Rainfall Ratio condition (no spatial coverage requirement).

**No Data (ND)**
An iRAINS departure category indicating that no valid rainfall data is available for the geographic unit for the selected period. Represented by grey shading in maps and reports.

**No Rain (NR)**
An iRAINS departure category indicating that the actual rainfall was zero (−100% departure). Represented by white cells in rainfall reports.

**Node.js**
A server-side JavaScript runtime built on Chrome's V8 engine. Used as the runtime environment for the iRAINS backend server.

**Normal Rainfall (N)**
An iRAINS departure category indicating actual rainfall within −19% to +19% of the climatological normal. Colour-coded green in maps and reports.

**NWP (Numerical Weather Prediction)**
The use of mathematical models of the atmosphere to predict weather based on current atmospheric conditions. iRAINS displays rainfall forecast products from multiple NWP systems.

**ORG (Ordinary Rain Gauge)**
A traditional manual rainfall observation instrument read by a trained observer. ORG observations are entered manually into iRAINS by MC users.

**pg (node-postgres)**
The official PostgreSQL client library for Node.js, providing connection pooling and parameterised query support. Used for all database interactions in the iRAINS backend.

**PostgreSQL**
An open-source object-relational database management system used as the primary data store for iRAINS.

**PrimeNG**
An open-source UI component library for Angular providing advanced components such as multi-select dropdowns, data tables, and tree selectors. Used in Data Entry, Station Statistics, and Yearly Station Statistics sections.

**QPF (Quantitative Precipitation Forecast)**
A numerical forecast of the amount of precipitation expected in a given area over a specified period. QPF Verification Reports in iRAINS archive the performance assessments of these forecasts.

**R (Rainfall Ratio)**
The ratio of actual rainfall to normal rainfall for a geographic unit, used as the primary input for monsoon activity classification. R = Actual ÷ Normal.

**Region (Homogeneous Region)**
One of five climatologically homogeneous regions of India: Central India, East and North-East India, North-West India, South Peninsular India, and Islands. Region-level aggregation uses subdivision weights.

**RIMES (Regional Integrated Multi-Hazard Early Warning System)**
An intergovernmental organisation based at the Asian Institute of Technology in Thailand that supports multi-hazard early warning systems in Asia and Africa. RIMES co-develops iRAINS through the IRU.

**RMC (Regional Meteorological Centre)**
A sub-regional office of IMD responsible for forecast and observation services within a defined geographic region. Similar in role to MC for iRAINS purposes.

**Sentinel Value**
A special value used to indicate a specific condition rather than a real data value. In iRAINS, −999.9 is the universal sentinel for "No Data" (missing or unreported observation).

**SP (Special Permission)**
A read-only iRAINS user role with access to visualization and analysis features but no data entry, verification, or administrative capabilities.

**Spatial Distribution**
An IMD classification system for assessing the geographic coverage of rainfall across a region, based on the percentage of stations reporting rainfall ≥ 0.1 mm. Categories: Isolated (≤25%), Scattered (>25–50%), Fairly Widespread (>50–75%), Widespread (>75%).

**Station Code**
A unique 13-digit hierarchical code assigned to each rainfall observation station in iRAINS, encoding the station's Region, Subdivision, State, District, Block, and individual station identity.

**Subdivision (Meteorological Subdivision)**
One of the 36 meteorological subdivisions of India defined by IMD for climate and rainfall analysis. Subdivisions form the primary unit for departure reporting and monsoon activity classification.

**Subdued Monsoon**
A monsoon activity category indicating suppressed or fading rainfall activity. Requires that both the current day and the previous day have a Rainfall Ratio below 1.0 and Spatial Distribution in the Isolated or Scattered category.

**SW Monsoon (Southwest Monsoon)**
The primary monsoon system affecting India between June and September, delivering approximately 70–80% of India's total annual rainfall. Active Monsoon criteria during SW Monsoon require the Rainfall Ratio, Spatial Distribution, and heavy-rain station conditions to all be satisfied simultaneously.

**Turf.js (@turf/turf)**
A geospatial analysis library for JavaScript, implementing standard GIS operations including point-in-polygon testing, centroid calculation, and polygon area computation. Used in iRAINS Station Statistics for the polygon selection tool.

**Upsert**
A database operation that inserts a new record if no matching record exists, or updates the existing record if a conflict is detected. Used in iRAINS for all rainfall data writes to prevent duplicate records.

**Very Heavy Rainfall**
An IMD rainfall intensity category for daily observations between 115.6 mm and 204.4 mm.

**Very Light Rainfall**
An IMD rainfall intensity category for daily observations between 0.1 mm and 2.4 mm.

**Vigorous Monsoon**
The highest monsoon activity category, requiring Rainfall Ratio above 4.0, at least two stations with heavy rainfall exceeding the regional threshold, and Spatial Distribution in the Fairly Widespread or Widespread category.

**Weak Monsoon**
A monsoon activity category indicating Rainfall Ratio below 0.5 (actual rainfall less than half the normal).

**Widespread**
The highest Spatial Distribution category in iRAINS, indicating that more than 75% of stations in the geographic unit reported rainfall ≥ 0.1 mm on the given date.

**XLSX (SheetJS)**
A JavaScript library for reading and writing Excel file formats (`.xlsx`, `.xls`, `.csv`). Used in iRAINS for both parsing uploaded Excel files (Data Entry, Station Management) and generating styled Excel exports (Yearly Station Statistics, Verification HQ, Spatial Distribution).

---

# ***Appendix E: Standard IMD Rainfall Classification Reference*** {#appendix-e .unnumbered}

This appendix consolidates all standard IMD rainfall classification systems referenced throughout this document into a single reference location.

---

## **E.1 Rainfall Departure Classification (All Geographic Levels)**

Used in: Rainfall Map, Dashboard, Rainfall Statistics, Rainfall Departures, QPF Verification, Rainfall Reports, and all departure-based products.

| Category | Code | Departure from Normal | Report Colour |
|---|---|---|---|
| Large Excess | LE | ≥ +60% above normal | Blue |
| Excess | E | +20% to +59% above normal | Light Blue |
| Normal | N | −19% to +19% of normal | Green |
| Deficient | D | −20% to −59% below normal | Red |
| Large Deficient | LD | −60% to −99% below normal | Yellow |
| No Rain | NR | −100% (zero actual rainfall) | White |
| No Data | ND | No valid observation available | Grey |

---

## **E.2 Seasonal Rainfall Departure Classification (All-India Seasonal)**

Used for All-India seasonal monsoon assessments (June–September):

| Category | Criterion |
|---|---|
| Normal | 90% to 110% of LPA (LPA = 880.6 mm, 1961–2010) |
| Below Normal | Less than 90% of LPA |
| Above Normal | Greater than 110% of LPA |

---

## **E.3 Station Rainfall Intensity Classification**

Used in: Station Statistics, Yearly Station Statistics (map markers and pie charts).

| Category | Daily Rainfall Range | Map Marker Colour |
|---|---|---|
| Zero Rainfall | 0 mm | Grey |
| Very Light Rainfall | 0.1 mm to 2.4 mm | Light Yellow |
| Light Rainfall | 2.5 mm to 15.5 mm | Light Green |
| Moderate Rainfall | 15.6 mm to 64.4 mm | Green |
| Heavy Rainfall | 64.5 mm to 115.5 mm | Orange |
| Very Heavy Rainfall | 115.6 mm to 204.4 mm | Red |
| Extremely Heavy Rainfall | Above 204.4 mm | Dark Red |

---

## **E.4 Spatial Distribution Classification**

Used in: Spatial Distribution section.

| Category | Percentage of Stations Reporting Rainfall ≥ 0.1 mm | Map Colour |
|---|---|---|
| Isolated | 0% to 25% | Bright Green (#03ff3f) |
| Scattered | >25% to 50% | Dark Green (#00683a) |
| Fairly Widespread | >50% to 75% | Cyan (#00fcf1) |
| Widespread | >75% | Blue (#3400f6) |

---

## **E.5 Monsoon Activity Classification**

Used in: Monsoon Activity section.

| Activity | Map Colour | Criteria Summary |
|---|---|---|
| Vigorous | Red (#ff0000) | R > 4.0 + heavy rain stations + Widely Spread coverage |
| Active | Orange (#ff9900) | 1.5 ≤ R ≤ 4.0 + conditions (SW monsoon: heavy stations + coverage required; NE monsoon: R criterion only) |
| Normal | Green (#00ff00) | Default — does not meet other criteria |
| Weak | Yellow (#ffff00) | R < 0.5 |
| Subdued | Grey (#999999) | R < 1.0 AND Isolated/Scattered on today AND previous day |

---

## **E.6 IMD Monsoon Drought / Flood Classification**

For reference by users interpreting extended rainfall deficits or surpluses.

| Classification | Criterion |
|---|---|
| Meteorological Drought | Seasonal rainfall < 75% of Long-Term Average |
| Moderate Drought | Seasonal rainfall deficit of 26%–50% of normal |
| Severe Drought | Seasonal rainfall deficit > 50% of normal |
| Flash Flood | Major flood occurring within 6 hours of heavy/excessive rainfall |

---

# ***Appendix F: Frequently Asked Questions*** {#appendix-f .unnumbered}

This appendix addresses common questions from operational users, system administrators, and technical staff regarding iRAINS functionality, data interpretation, and system behaviour.

---

## **F.1 Data Entry and Station Management**

**Q: A station is not appearing in my Data Entry table. Why?**

A: Stations appear in the Data Entry table based on two conditions: (1) the station must be active in the `station_details` table, and (2) the station must be assigned to your Meteorological Centre. If a station assigned to your centre is missing, contact the HQ administrator to verify that the station's centre assignment code in `station_details` matches your centre's identifier and that the station is marked as active. Newly added stations may require a page refresh to appear.

**Q: I accidentally entered an incorrect rainfall value and saved it. How do I correct it?**

A: Return to the Data Entry section, locate the station using the filter panel, and re-enter the correct value in the same field. The system uses an upsert operation, meaning that saving a new value for the same station and date will overwrite the previous entry. If the record has already been verified by HQ, contact the HQ administrator to unverify it before making the correction, so that it can be re-verified after the update.

**Q: Can I enter data for a date other than today?**

A: Yes. The date selector in the Data Entry section allows you to enter data for any past date. This supports late-entry corrections and the entry of data from stations that experienced communication delays. Future dates cannot be entered. When entering data for a past date, ensure that the entry is clearly flagged in your centre's records so that any downstream reports generated before the correction was made can be updated if required.

**Q: What does the sentinel value −999.9 mean when I see it in exported data?**

A: The value −999.9 is iRAINS's No Data sentinel — it indicates that no valid rainfall observation was collected for that station on that date. It is used internally by the database and may appear in raw data exports or bulk upload templates. In all visualisation and calculation modules, −999.9 values are excluded before any averaging or aggregation takes place. Users should not enter −999.9 intentionally to represent zero rainfall; zero rainfall should be entered as 0 (zero). A blank cell in bulk upload templates is treated as No Data.

**Q: What station types does iRAINS support?**

A: iRAINS supports three station types: ORG (Ordinary Rain Gauge), ARG (Automatic Rain Gauge), and AWS (Automatic Weather Station). Station type is recorded in the `station_type` field of the `station_details` table and is set when the station is added by an HQ administrator. Some map views and statistical filters treat AWS stations separately from ORG and ARG stations for comparative analysis purposes.

**Q: How is the 13-digit station code structured?**

A: The 13-digit station code is a hierarchical identifier encoding the station's geographic location within India's administrative structure. Reading from left to right, the digits encode: Region (2 digits), Subdivision (2 digits), State (2 digits), District (2 digits), Block (2 digits), and Station serial number within Block (3 digits). This hierarchical encoding allows the system to automatically determine administrative assignments from the station code, reducing the possibility of inconsistent metadata.

---

## **F.2 Rainfall Values and Calculations**

**Q: The Departure percentage is showing an extremely high value (e.g., +9900%). Is this an error?**

A: Extreme departure percentages arise when Normal Rainfall for a unit is very close to zero but Actual Rainfall is non-zero. The departure formula divides by the Normal value (or 0.01 if Normal is exactly zero), so a small denominator amplifies even modest actual rainfall into a very large percentage. This is mathematically correct but may be operationally misleading in the driest regions during the non-monsoon season. Users should interpret departure percentages in conjunction with the absolute rainfall amounts. Very high departure percentages occurring alongside very small actual rainfall amounts (e.g., 2mm actual vs. 0.01mm normal = +19,900%) should be read as "any measurable rainfall in an extremely dry period" rather than a genuinely extreme rainfall event.

**Q: Why does the Actual Rainfall shown for a state differ from the sum of its district values?**

A: State-level Actual Rainfall in iRAINS is computed as an area-weighted average of the district-level values — not their sum. The formula is: State Actual = Σ(District Actual × District Area) ÷ Σ(District Area). This area-weighted average is designed to produce a representative rainfall figure for the state as a whole, accounting for the fact that larger districts should contribute more to the state average than smaller ones. Summing district values would produce an accumulated total, not a representative average.

**Q: What happens to the aggregation if some districts have no data?**

A: Districts with no valid station data (where all stations in the district recorded −999.9 or no readings were submitted) are excluded entirely from the area-weighted calculation. Both the numerator and denominator terms for that district are omitted. As a result, the state or subdivision value is computed from only the districts that have data. If more than a threshold proportion of districts in a state are missing, the state value itself may be shown as No Data in some views.

**Q: How is Normal Rainfall determined for a district?**

A: Normal Rainfall for each district is the pre-calculated Long Period Average (LPA) for that district and calendar period, stored in the `normal_district` table. These values represent the average rainfall observed over a reference climatological period (typically 30 years) and are loaded into the database during system setup by IMD's climate data management team. They are not recomputed during daily operations. For the selected date range in any module, the Normal Rainfall is the sum of the daily normal values for each day in the range.

**Q: When is the cut-off time for daily data used in reports?**

A: iRAINS uses a daily data cut-off of 07:50 UTC (corresponding to approximately 13:20 IST). Reports generated for a given date use all station data submitted and verified before this cut-off time. Data submitted or corrected after the cut-off for a given date will be reflected in subsequently generated reports but will not automatically update previously distributed report files.

**Q: Why does the Normal Rainfall for two different periods not add up consistently?**

A: Normal Rainfall values in iRAINS are computed from pre-stored daily normal reference values that are summed over the selected date range. The normal values for individual days may vary due to the daily granularity of the long-period averages — they represent the average rainfall on that specific calendar day across the reference period, which can vary significantly between adjacent days due to natural intra-seasonal variability in the historical record.

---

## **F.3 Maps and Visualisation**

**Q: The map is showing grey (No Data) for many districts, even though data has been entered. What is happening?**

A: Grey colouring on the Rainfall Map indicates that no valid aggregated rainfall value could be computed for that unit. This can occur if: (1) no stations in the district submitted data for the selected date, (2) all station readings were −999.9 (No Data), or (3) a data quality exclusion flag is active for the district. First verify that station data was entered and saved correctly in the Data Entry section. If entry was confirmed, check with the HQ administrator whether a calculation exclusion is active for the affected district. Also verify that the selected date in the map filter matches the date for which data was entered.

**Q: The Block-level map shows different values from the District-level map for the same area. Why?**

A: Block-level and District-level maps use different input data and aggregation logic. The District-level map aggregates all ORG, ARG, and AWS station readings within each district to produce a single representative value. The Block-level map shows the average of stations specifically assigned to each block, which may include only AWS stations in some configurations. Because the station coverage and type differ between the two map views, the resulting rainfall values are not expected to be identical.

**Q: Can I view the Rainfall Map for a future date?**

A: No. The Rainfall Map only displays data for dates for which station observations have been entered. Future dates have no data and will appear entirely grey. For future rainfall guidance, the NWP Rainfall Products section provides Day+1 through Day+7 model forecast maps.

**Q: What does the Station Coverage Statistics panel show?**

A: The Station Coverage Statistics panel provides a tabular and graphical summary of how many meteorological stations have reported data within each district, state, or subdivision for the selected date. A high coverage percentage indicates that most active stations in that area have submitted readings; a low percentage may indicate data submission delays or communication issues at certain centres. The panel helps HQ staff identify areas where coverage is poor before interpreting the spatial rainfall pattern on the map.

**Q: The NWP Rainfall Products section shows "Product Not Available" for a model I expected to see. What does this mean?**

A: This message indicates that the forecast image file for the selected model, initialization date, and lead time has not yet been ingested into the iRAINS server. NWP products are typically ingested after each model run completes, which may take several hours after the nominal run time. If the product is missing and sufficient time has passed since the expected run completion, contact the system administrator to verify that the ingestion pipeline is running correctly and that the server storage directory is accessible.

---

## **F.4 Verification**

**Q: A station I verified yesterday now shows "Not Verified" again. Has the verification been reset?**

A: Verification status can be reset if the underlying station data record is updated after verification. If the MC for that station submitted a corrected reading after you verified the original entry, the upsert operation overwrites the existing record, which clears the `is_verified` flag as part of the correction workflow. This design ensures that a corrected record must be re-reviewed before it is considered formally verified. Check the Data Actions log in the Log Info section to confirm whether a data correction was submitted after your verification action.

**Q: I need to verify data for a large number of stations quickly. What is the most efficient approach?**

A: Use the Bulk Verify function in the Verification HQ section. After reviewing the station table and confirming that the listed values appear correct, use the checkboxes to select all stations in a group (or use the Select All option for a centre), then click the Bulk Verify button. The system processes all selected verifications simultaneously and records the timestamp and your user identifier for each. The cumulative verification table in the Verification HQ section can be used to confirm that the bulk verification was applied correctly.

**Q: Can MC users verify their own data?**

A: No. In iRAINS, the verification action is reserved for HQ users (and in some configurations, senior SP users). This design implements a two-person quality check — the MC user enters data for their own stations, and a separate HQ authority independently reviews and verifies it. This separation of duties is a core data quality control principle of the iRAINS verification workflow.

---

## **F.5 Reports and Exports**

**Q: The PDF report I generated shows "N/A" or dashes in some cells. What does this mean?**

A: "N/A" or dash cells in generated reports indicate that no valid rainfall data was available for the corresponding geographic unit and time period. This typically means that no stations in the unit submitted data, or that all submitted readings were flagged as No Data. Users should verify data completeness for the affected areas before distributing the report.

**Q: The Excel export from the Rainfall Statistics section shows different colours than the PDF. Is this expected?**

A: Yes. The PDF report applies full IMD departure category colours using jsPDF's cell colouring capabilities. The Excel export uses xlsx-js-style to apply equivalent background fill colours to cells, but the exact shade may differ slightly between the two formats due to differences in how the two libraries render colour values. The departure category assigned to each cell (LE, E, N, D, LD, NR, ND) is identical in both formats.

**Q: I need data in CSV format rather than Excel. Is this supported?**

A: Direct CSV export is not natively available in iRAINS. The Excel (XLSX) exports can be opened in any spreadsheet application (Microsoft Excel, LibreOffice Calc, Google Sheets) and saved as CSV from within that application. Alternatively, technical staff can query the underlying PostgreSQL database directly for bulk data extracts in CSV format, subject to appropriate authorization.

**Q: Can I generate a report for the entire year as a single file?**

A: Yes. The Rainfall Reports section accepts any user-defined date range. To generate an annual report, enter January 1 as the start date and December 31 as the end date for the desired year. The system will compute the actual, normal, and departure values for the full calendar year and generate the appropriate PDF. Note that annual reports — particularly at District level — produce large PDF files and may take longer to generate than shorter-period reports.

---

## **F.6 Access, Security, and Administration**

**Q: I have forgotten my iRAINS password. How do I reset it?**

A: Password resets must be performed by the HQ system administrator. Contact your HQ administrator with your username, and the administrator will update the credential in the `login` table. There is no self-service password reset mechanism in the current version of iRAINS. Users are advised to use strong, unique passwords and to change them periodically in coordination with the HQ administrator.

**Q: Can I access iRAINS from outside the IMD network?**

A: Access to iRAINS is governed by the network security policies of IMD. If the deployment is configured for internet-accessible operation, users can access iRAINS from any device with a modern web browser. If the deployment is restricted to IMD's internal network (intranet), users outside the network will require VPN access or must access the system from IMD premises. Contact your system administrator for the specific access policy applicable to your deployment.

**Q: How long are user sessions valid before I am required to log in again?**

A: iRAINS uses JWT (JSON Web Token) authentication. Each login token is issued with a configurable expiry duration. In the default configuration, sessions expire after a period of inactivity. When the session expires, the user is redirected to the login page. The session duration can be adjusted by the system administrator through the application's configuration settings.

**Q: What should I do if I notice suspicious activity in the Log Info section — for example, data changes attributed to a user who should not have been active?**

A: Immediately report the observation to the HQ administrator. The Log Info section's User Action Log provides timestamped records of all login and data modification events. The administrator should verify whether the activity corresponds to a legitimate user session, check for unauthorized access from unexpected IP addresses, and if necessary, disable the affected user account pending investigation. All audit logs should be preserved for any security investigation.

**Q: Can I use iRAINS on a mobile device?**

A: iRAINS is designed primarily for desktop browser use. The interactive map components and multi-column data tables are optimized for screen resolutions typical of desktop and laptop computers. While the application may be accessible on a tablet browser in landscape mode, full functionality — particularly for data entry tables and export features — may be limited on small-screen mobile devices. For best results, use a desktop or laptop computer with a modern browser (Chrome, Firefox, Edge).

---

# ***Appendix G: Technical Specifications and System Configuration*** {#appendix-g .unnumbered}

This appendix provides technical reference information for system administrators and IT staff responsible for deploying, maintaining, and configuring iRAINS.

---

## **G.1 System Requirements**

### **Server Requirements**

| Component | Minimum Specification | Recommended Specification |
|---|---|---|
| Operating System | Ubuntu 20.04 LTS or CentOS 7.x | Ubuntu 22.04 LTS |
| CPU | 4 cores, 2.4 GHz | 8 cores, 3.0 GHz |
| RAM | 8 GB | 16 GB |
| Storage (OS + App) | 50 GB SSD | 100 GB SSD |
| Storage (Database) | 100 GB | 500 GB+ (depending on station network size and data history) |
| Network | 100 Mbps internal | 1 Gbps internal |
| Node.js Version | 16.x LTS | 18.x LTS |
| PostgreSQL Version | 13.x | 15.x |

### **Client Requirements (End-User Browser)**

| Component | Requirement |
|---|---|
| Browser | Chrome 90+, Firefox 90+, Edge 90+ (Chromium-based) |
| Screen Resolution | Minimum 1280 × 768; Recommended 1920 × 1080 |
| JavaScript | Must be enabled |
| Network | Any network with access to the iRAINS deployment URL |
| Memory | Minimum 4 GB RAM on client device recommended for smooth map rendering |

---

## **G.2 Technology Stack and Software Versions**

| Component | Technology | Version |
|---|---|---|
| Frontend Framework | Angular | 16.x |
| Frontend Language | TypeScript | 5.x |
| Interactive Maps | Leaflet.js | 1.9.x |
| Charts | Highcharts (angular-highcharts) | 11.x |
| PDF Generation (Frontend) | jsPDF | 2.x |
| PDF Generation (Backend) | jsPDF-autotable | 3.x |
| Excel Generation | xlsx-js-style | 1.x |
| Spatial Polygon Tools | Turf.js, leaflet-draw | 6.x / 1.x |
| UI Components | PrimeNG, Angular Material | 16.x / 15.x |
| Email Service | Nodemailer | 6.x |
| Date Handling | Moment.js | 2.x |
| Map Image Export | html-to-image | 1.x |
| Backend Framework | Node.js + Express | 18.x / 4.x |
| Database | PostgreSQL | 15.x |
| Authentication | JSON Web Token (JWT) | 9.x |
| Build Tool | Angular CLI | 16.x |

---

## **G.3 Application Configuration Parameters**

The iRAINS backend is configured through environment variables and a configuration file. The following parameters govern key system behaviours:

| Parameter | Description | Default Value |
|---|---|---|
| `DB_HOST` | PostgreSQL database server hostname or IP address | `localhost` |
| `DB_PORT` | PostgreSQL database server port | `5432` |
| `DB_NAME` | Name of the iRAINS PostgreSQL database | `irains_db` |
| `DB_USER` | Database user account for application connections | `irains_user` |
| `DB_PASSWORD` | Password for the database user account | (set at deployment) |
| `JWT_SECRET` | Secret key used to sign and verify JWT authentication tokens | (set at deployment) |
| `JWT_EXPIRY` | JWT token validity duration | `8h` |
| `SMTP_HOST` | SMTP server hostname for email dissemination | (configured at deployment) |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP authentication username | (configured at deployment) |
| `SMTP_PASS` | SMTP authentication password | (configured at deployment) |
| `NWP_ASSETS_PATH` | File system path to the NWP forecast image directory | `/var/irains/nwp/` |
| `QPF_PDF_PATH` | File system path to the QPF Verification Report PDF directory | `/var/irains/qpf/` |
| `DATA_CUTOFF_UTC` | Daily data processing cut-off time in UTC | `07:50` |
| `PORT` | Port on which the Express application listens | `3000` |
| `NODE_ENV` | Deployment environment (development / production) | `production` |

---

## **G.4 Database Maintenance Procedures**

### **Routine Backup**

The iRAINS PostgreSQL database should be backed up daily using `pg_dump` to a compressed archive. A typical backup command is:

> `pg_dump -U irains_user -Fc irains_db > irains_backup_$(date +%Y%m%d).dump`

Backup files should be stored in a separate location from the primary database server. A minimum of 30 days of daily backups should be retained. Monthly backups should be retained for at least one year.

### **Database Vacuuming**

PostgreSQL's autovacuum daemon should be enabled and monitored. For high-frequency tables such as `station_daily_data_updates` and `data_actions`, which receive daily inserts and updates, periodic manual `VACUUM ANALYZE` operations are recommended at the end of each month to maintain query performance.

### **Index Maintenance**

The `station_daily_data_updates` table carries composite indexes on `(station_code, collection_date)` to support the upsert operations and date-range queries that form the core of the aggregation pipeline. These indexes should be monitored for bloat using `pg_stat_user_indexes` and rebuilt periodically using `REINDEX` if bloat exceeds 30%.

### **Log Table Archiving**

The `data_actions` and `station_logs` audit tables grow continuously as operational activity accumulates. Records older than two years may be archived to separate historical tables or exported to CSV and removed from the active tables to maintain query performance. Archival should be performed during off-peak hours. Ensure that the Log Info module's queries are updated to reference the archive tables if the data is moved rather than simply deleted.

---

## **G.5 NWP Product Ingestion**

NWP forecast images are generated externally by IMD's modelling infrastructure and must be ingested into the iRAINS server for the NWP Rainfall Products section to display them. The ingestion process follows this structure:

**Directory Structure**

Forecast images are stored under the path configured in `NWP_ASSETS_PATH`, organized as:
`{NWP_ASSETS_PATH}/{model_code}/{init_date}/{lead_day}/{view_type}/forecast_image.png`

Where:
- `model_code` is one of: `wrf_arw`, `imd_gfs`, `imd_gfs_bc`, `ncum`, `ncum_r_00z`, `ncum_r_12z`, `gefs`, `neps`
- `init_date` is formatted as `YYYYMMDD`
- `lead_day` is a two-digit number: `01`, `02`, `03`, `04`, `05`, `06`, `07`
- `view_type` is either `mc` (Meteorological Centre) or `rb` (River Basin)

**Ingestion Process**

The IMD modelling team is responsible for placing new forecast images in the designated directory following each model run. The iRAINS application does not perform any image processing — it serves the files as-is. The `available-dates` API endpoint scans the directory structure to determine which dates and models are available.

**Monitoring Ingestion**

If forecast products are not appearing in the NWP Rainfall Products section for an expected date, the administrator should:
1. Verify that the model run completed successfully on the modelling server.
2. Check that the file transfer to the iRAINS server completed without errors.
3. Confirm that the files are named according to the expected naming convention.
4. Verify that the `NWP_ASSETS_PATH` configuration is correctly pointing to the ingestion directory.

---

## **G.5a Daily Data Refresh and Update Schedule**

The iRAINS platform operates on a defined daily data refresh cycle that governs when new rainfall observations become visible across all analytical and visualization modules. Understanding this schedule is essential for interpreting data availability, particularly when monitoring real-time conditions during the monsoon season.

**Daily Update Cycle**

| Time (IST) | Activity | Description |
|---|---|---|
| 08:30 – 11:00 | Data Entry Window | MC and RMC users enter previous day's 24-hour rainfall observations across all assigned stations. |
| 11:00 | Reminder Trigger | Automated reminder emails are dispatched to centres that have not yet completed data entry or verification for the current day. |
| 11:30 | Initial Daily Data Update | The platform performs its first full daily aggregation cycle: district-level averages are computed from all submitted station data, and higher-level (state, subdivision, region, country) weighted aggregations are recalculated. After this cycle completes, all visualization modules — Rainfall Map, Dashboard, Rainfall Statistics, Rainfall Departures, Spatial Distribution, and Monsoon Activity — reflect the day's submitted data for the first time. |
| 11:30 onwards | Half-Hourly Refresh Cycle | After the initial 11:30 update, the backend aggregation process continues to run every 30 minutes throughout the remainder of the operational day. Each half-hourly cycle picks up any new entries or corrections submitted since the previous cycle and recalculates the affected aggregation levels. This ensures that late submissions from centres that complete data entry after 11:30 are incorporated into the platform without waiting until the following day. |
| 07:50 UTC (13:20 IST) | Report Data Cut-Off | The Rainfall Reports section uses a fixed cut-off of 07:50 UTC (13:20 IST) for data used in auto-generated daily reports. Reports generated after this time on any given day will reflect the 07:50 UTC snapshot. |

**Implication for Users**

- **Before 11:30 IST:** The platform may not yet reflect the current day's observations. The Rainfall Map and Dashboard will show the previous day's data as the most recent complete picture.
- **At 11:30 IST and after:** Current-day data becomes available and refreshes progressively as more centres complete their submissions. Maps, charts, and departure tables will update approximately every 30 minutes to incorporate late entries.
- **Verification status:** The half-hourly refresh does not distinguish between verified and unverified data. All submitted observations (verified or pending) are included in the aggregation cycles. The `is_verified` flag in the Verification HQ and Verification MC sections reflects the verification status independently of the refresh cycle.
- **Completeness before analysis:** For the most accurate daily assessment, users should wait until the Verification MC summary shows near-complete submission across all active centres before drawing conclusions from the statistical modules (Rainfall Statistics, Rainfall Departures, Monsoon Activity). A useful rule of thumb is to defer final analysis until the update cycle following verification completion, typically between 13:00 and 14:00 IST.

**Configuration Notes**

The half-hourly refresh cycle is implemented as a server-side scheduled task. The interval is configurable in the application's cron configuration file. The default interval is 30 minutes. If operational requirements change — for example, during high-activity monsoon events when real-time visibility is critical — the interval can be reduced to 15 minutes by adjusting the cron schedule without any application code change. Changes to the refresh interval take effect at the next cron execution after the configuration change.

| Configuration Parameter | Default Value | Description |
|---|---|---|
| `INITIAL_DAILY_AGGREGATION_TIME` | 11:30 IST | Time of the first daily full aggregation run |
| `REFRESH_INTERVAL_MINUTES` | 30 | Interval (in minutes) between subsequent aggregation cycles |
| `REPORT_DATA_CUTOFF_UTC` | 07:50 | UTC time at which auto-generated report data is frozen |
| `REMINDER_EMAIL_TIME_IST` | 11:00 | IST time at which data entry/verification reminder emails are sent |

---

## **G.6 Email Dissemination Configuration**

The Dissemination section's email functionality requires a configured SMTP server. iRAINS uses the Nodemailer library for email dispatch, supporting both SMTP and SMTP+TLS connections.

**Configuration Requirements**

- SMTP server must be accessible from the iRAINS application server.
- The `SMTP_USER` account must have permission to send email on behalf of the configured sender address.
- For SMTP+TLS (recommended for external mail servers), the server's TLS certificate must be valid or the `tls: { rejectUnauthorized: false }` option may be set in development environments only.
- For very large attachments (multiple PDF reports and map images), ensure the SMTP server's maximum message size limit is set appropriately (minimum 20 MB recommended).

**Testing Email Configuration**

The system administrator can test the email configuration by navigating to the Dissemination section, composing a test message to a known internal address, and verifying receipt. The Email Log in the Dissemination section will confirm whether the send operation was recorded successfully.

**Automated Reminder Emails**

The automated data-entry and verification reminder system relies on a server-side scheduled task (cron job) configured on the deployment server. The cron schedule should be set to trigger the reminder check at approximately 11:00 IST daily, after the morning data entry window closes. The reminder task queries the verification status for the current day and dispatches reminder emails to centres where data submission or verification is incomplete.

---

## **G.7 User Account Management**

User accounts are managed directly in the `login` table in the PostgreSQL database. The HQ system administrator performs account creation and modification using appropriate database management tools. The following fields govern user access:

| Field | Description |
|---|---|
| `username` | Unique login identifier for the user |
| `password` | Hashed password (bcrypt hash) — never stored in plain text |
| `role` | Access role: `hq`, `mc`, `rmc`, or `sp` |
| `centre_code` | The Meteorological Centre code to which the user belongs (MC and RMC roles only) |
| `full_name` | User's full name for display and audit purposes |
| `is_active` | Boolean flag — set to false to disable access without deleting the account |
| `last_login` | Timestamp of the user's most recent successful login |

**Adding a New User**

To add a new user, the administrator inserts a new row into the `login` table with the appropriate role, centre code, and a bcrypt-hashed password. New users should be advised to note their assigned password and change it upon first login if a password change mechanism is available in the deployment.

**Disabling a User Account**

To disable access for a departing user without losing their audit trail, set `is_active` to false rather than deleting the record. All previous data entry, verification, and log records attributed to that user's `username` will be preserved in the audit tables.

**Password Hashing**

Passwords must be stored as bcrypt hashes with a minimum salt factor of 10. Plain-text passwords must never be written to the `login` table under any circumstances. The iRAINS authentication service uses the bcrypt comparison function to verify submitted passwords against the stored hash.

---

## **G.8 Performance Tuning Notes**

**Connection Pooling**

The Node.js backend uses a PostgreSQL connection pool. The pool size should be configured based on the expected concurrent user load. For a deployment supporting up to 50 concurrent users, a pool of 10–20 connections is typically sufficient. Excessively large pools can saturate PostgreSQL's connection limit; excessively small pools can create queuing delays under peak load.

**Aggregation Query Optimization**

The multi-level rainfall aggregation queries are the most computationally intensive operations in iRAINS. For the largest geographic scope (District-level reports covering all of India), queries may scan millions of station-day records. The following optimisations are critical:

- Ensure that the `(station_code, collection_date)` composite index on `station_daily_data_updates` is present and not bloated.
- Partition the `station_daily_data_updates` table by year or quarter if the table grows beyond 10 million rows. PostgreSQL's declarative table partitioning allows the query planner to skip irrelevant date partitions, dramatically reducing scan times for bounded date-range queries.
- Cache frequently requested aggregation results (e.g., yesterday's district-level summaries) in a pre-aggregated summary table that is populated by a scheduled background task each morning after the data cut-off.

**Static Asset Serving**

NWP forecast images and QPF PDF reports can be large files. Ensure that the deployment's web server (Nginx or Apache, if used as a reverse proxy in front of Node.js) is configured to serve static files from the file system directly, bypassing the Node.js application layer. This dramatically improves throughput for image and PDF file delivery.

---


# ***Appendix H: iRAINS Calculation Formula Reference*** {#appendix-h .unnumbered}

This appendix consolidates all mathematical formulas and computation rules used within iRAINS. Formulas are presented in plain language with symbolic notation, accompanied by specification tables that define each formula's scope, input variables, special cases, and the module(s) in which it is applied.

---

## **H.1 Core Departure Formula**

**Formula:**

> **Departure (%) = ( Actual Rainfall − Normal Rainfall ) ÷ Normal Rainfall × 100**

**Applied In:** All iRAINS modules that display or compute departure from normal — Rainfall Map, Dashboard, Rainfall Statistics, Rainfall Departures, Spatial Distribution, Monsoon Activity, Rainfall Reports.

**Input Variables:**

| Variable | Symbol | Description | Units |
|---|---|---|---|
| Actual Rainfall | A | Observed rainfall for the geographic unit and time period | mm |
| Normal Rainfall | N | Long-period average rainfall for the same unit and period | mm |
| Departure Percentage | D | Deviation of actual from normal, expressed as a percentage | % |

**Special Case Rules:**

| Condition | Rule Applied | Result |
|---|---|---|
| Actual Rainfall is NULL (no data) | Return NULL | Departure shown as ND (No Data) |
| Actual Rainfall = 0 | Return −100 | Departure = −100% (complete deficit) |
| Normal Rainfall = 0 | Replace N with 0.01 | Avoids division by zero; produces a very large positive departure |
| Normal Rainfall > 0 | Apply standard formula | D = ((A − N) / N) × 100 |

**Classification of Departure Result:**

| Category | Code | Departure Range | Interpretation |
|---|---|---|---|
| Large Excess | LE | ≥ +60% | Substantially above normal rainfall |
| Excess | E | +20% to +59% | Above normal rainfall |
| Normal | N | −19% to +19% | Within normal range |
| Deficient | D | −20% to −59% | Below normal rainfall |
| Large Deficient | LD | −60% to −99% | Substantially below normal rainfall |
| No Rain | NR | −100% | Zero actual rainfall recorded |
| No Data | ND | NULL actual rainfall | No valid observation available |

---

## **H.2 Station-to-District Aggregation Formula**

**Formula:**

> **District Daily Actual = Average ( Valid Station Readings within District on Date d )**

More precisely:

> **District_d = Σ ( s ∈ valid_stations_in_district ) [ Rainfall(s, d) ] ÷ Count_valid(s, d)**

**Applied In:** All aggregation-based calculations — Rainfall Map, Dashboard, Rainfall Statistics, Rainfall Departures, Rainfall Reports, Spatial Distribution, Monsoon Activity.

**Input Variables:**

| Variable | Symbol | Description |
|---|---|---|
| Station rainfall reading | Rainfall(s, d) | Observed rainfall at station s on date d |
| Valid station | s ∈ valid | Station whose reading is not −999.9 and not < 0 |
| District daily actual | District_d | Average of valid readings in the district on date d |

**Data Filtering Rules Before Aggregation:**

| Condition | Rule |
|---|---|
| Reading = −999.9 | Exclude (No Data sentinel) |
| Reading < 0 (other than −999.9) | Exclude (invalid negative) |
| Reading ≥ 0 | Include in average |

**Period Accumulation:**

> **District Actual (Period [d1 to d2]) = Σ District_d for d in [d1, d2]**

The daily averages for all days in the selected date range are summed to produce the district's total rainfall for the period.

---

## **H.3 State and Subdivision Area-Weighted Averaging Formula**

**Formula:**

> **State (or Subdivision) Actual = Σ ( District_actual_period × District_area ) ÷ Σ ( District_area )**

Where the summation is over all districts within the State (or Subdivision) that have valid data for the period.

**Applied In:** Rainfall Map (State and Subdivision views), Dashboard, Rainfall Statistics, Rainfall Reports.

**Input Variables:**

| Variable | Symbol | Description | Source |
|---|---|---|---|
| District period actual | D_i | Total actual rainfall for district i over the selected period | Computed from H.2 |
| District geographic area | A_i | Area of district i in km² | `normal_district_details.district_area` |
| State / Subdivision actual | S | Area-weighted average actual rainfall for the State or Subdivision | Result |

**Special Cases for Subdivision Calculation:**

| Condition | Rule |
|---|---|
| District code = 30506001 | Set district area A_i = 0 (district excluded from subdivision-level weighting) |
| District code = 30506002 | Set district area A_i = 0 (district excluded from subdivision-level weighting) |
| District has no valid data | Exclude both D_i and A_i from both numerator and denominator |

**Division by Zero Protection:**

> **If Σ ( District_area for valid districts ) = 0 → Return NULL**

If all districts within a State or Subdivision have no data, the State/Subdivision actual is set to NULL (No Data).

---

## **H.4 Region-Level Subdivision-Weighted Averaging Formula**

**Formula:**

> **Region Actual = Σ ( Subdivision_actual × Subdivision_weight ) ÷ Σ ( Subdivision_weight )**

Where the summation is over all subdivisions within the Region that have valid data.

**Applied In:** Rainfall Map (Region view), Dashboard, Rainfall Statistics, Rainfall Reports.

**Input Variables:**

| Variable | Symbol | Description | Source |
|---|---|---|---|
| Subdivision actual | SubDiv_j | Area-weighted actual rainfall for subdivision j | Computed from H.3 |
| Subdivision weight | W_j | Pre-assigned weighting factor for subdivision j | `normal_district_details.subdiv_weight` |
| Region actual | R | Weighted average actual rainfall for the Region | Result |

**Special Cases:**

| Condition | Rule |
|---|---|
| Subdivision has no valid data | Exclude both SubDiv_j and W_j from numerator and denominator |
| All subdivisions in region have no data | Return NULL for Region Actual |

**Division by Zero Protection:**

> **If Σ ( W_j for valid subdivisions ) = 0 → Return NULL**

---

## **H.5 Country-Level (All-India) Aggregation Formula**

**Formula (Triple-Nested Weighted Average):**

> **India Actual = Σ ( Region_actual_r × Region_weight_r ) ÷ Σ ( Region_weight_r )**

Where each Region_actual_r is itself computed from subdivision-weighted averages (H.4), which are computed from district area-weighted averages (H.3), which are computed from station-level daily averages (H.2).

**Applied In:** Rainfall Map (Country view), Dashboard, Rainfall Statistics, Rainfall Reports.

**Nested Formula Chain:**

> Station Readings → District Daily Average (H.2) → District Period Total → State/Subdivision Area-Weighted Average (H.3) → Region Subdivision-Weighted Average (H.4) → Country Region-Weighted Average (H.5)

**Country Normal Rainfall:**

> **India Normal = Σ ( Daily_normal_country_value ) for all days in the selected period**

The country-level normal is retrieved from the `normal_country` table, which stores pre-calculated daily all-India normal values for each calendar date.

---

## **H.6 Normal Rainfall Retrieval**

**Formula:**

> **Normal Rainfall (Level, Period [d1 to d2]) = Σ ( Daily_normal_value(Level, d) ) for d in [d1, d2]**

The normal rainfall for any geographic level and any time period is the sum of pre-stored daily normal reference values for that level over all days in the period.

**Normal Data Sources:**

| Geographic Level | Normal Table | Key Fields |
|---|---|---|
| District | `normal_district` | `district_code`, `date`, `rainfall_value` |
| State | `normal_state` | `state_code`, `date`, `rainfall_value` |
| Subdivision | `normal_sub_division` | `subdiv_code`, `date`, `rainfall_value` |
| Region | `normal_region` | `region_code`, `date`, `rainfall_value` |
| Country | `normal_country` | `country_name = 'INDIA'`, `date`, `rainfall_value` |

These tables are pre-populated at system setup from IMD's official long-period average dataset and are not modified during normal system operation. Updates to normal values (e.g., when IMD revises the climatological reference period) require a batch update by the system administrator.

---

## **H.7 Rainfall Ratio Formula (Monsoon Activity)**

**Formula:**

> **Rainfall Ratio R = Actual Rainfall ÷ Normal Rainfall**

Applied to each subdivision or district on each day for the purpose of Monsoon Activity classification.

**Applied In:** Monsoon Activity section.

**Input Variables:**

| Variable | Symbol | Description |
|---|---|---|
| Actual Rainfall | A | Area-averaged actual rainfall for the subdivision or district on the target date |
| Normal Rainfall | N | Pre-stored normal rainfall for the same unit and date |
| Rainfall Ratio | R | Ratio indicating how many times the actual rainfall exceeded the normal |

**Special Cases:**

| Condition | Rule |
|---|---|
| Normal Rainfall = 0 | Use N = 0.01 (prevents division by zero; produces very large R) |
| Actual Rainfall = NULL | R is treated as NULL; monsoon activity defaults to ND (No Data) |
| Actual Rainfall = 0 | R = 0 (maps to Weak monsoon if no other condition overrides) |

**R Thresholds Used in Monsoon Activity Classification:**

| R Value | Monsoon Activity Implication |
|---|---|
| R > 4.0 | Potential Vigorous condition (subject to additional criteria) |
| 1.5 ≤ R ≤ 4.0 | Potential Active condition (subject to additional criteria) |
| 0.5 ≤ R < 1.5 | Normal condition |
| R < 0.5 | Weak condition |
| R < 1.0 (sustained) | Potential Subdued condition (requires two consecutive Isolated/Scattered days) |

---

## **H.8 Spatial Distribution Percentage Formula**

**Formula:**

> **Spatial Coverage (%) = ( Stations_with_Rainfall ÷ Total_Active_Stations ) × 100**

**Applied In:** Spatial Distribution section, and as an input to the Monsoon Activity classification algorithm.

**Input Variables:**

| Variable | Description |
|---|---|
| Stations_with_Rainfall | Count of active stations in the geographic unit that recorded ≥ 0.1 mm on the target date |
| Total_Active_Stations | Count of all active stations assigned to the geographic unit |
| Spatial Coverage (%) | Percentage of the active station network that received measurable rainfall |

**Classification Thresholds:**

| Spatial Coverage | Category | IMD Terminology |
|---|---|---|
| 0% to 25% | Isolated | Rainfall restricted to isolated pockets |
| >25% to 50% | Scattered | Patchy or scattered rainfall |
| >50% to 75% | Fairly Widespread | Fairly widespread coverage |
| >75% | Widespread | Widespread rainfall across the unit |

**Special Cases:**

| Condition | Rule |
|---|---|
| Total_Active_Stations = 0 | Return NULL (no active station in unit) |
| All stations record 0 rainfall | Spatial Coverage = 0% → Isolated |
| No data (all −999.9) | Treated as no station for that date → excluded from count |

---

## **H.9 QPF Forecast Verification Score Formulas**

These formulas are used in the QPF Verification Reports (Appendix A section, Workflow 4) and are documented here for reference. They are not computed within iRAINS itself but appear in the archived QPF Verification Report PDFs.

**Probability of Detection (POD):**

> **POD = Hits ÷ ( Hits + Misses )**

| Symbol | Definition |
|---|---|
| Hits | Number of events where rainfall was both forecast and observed |
| Misses | Number of events where rainfall was observed but not forecast |
| POD | Perfect score = 1; No skill = 0 |

**False Alarm Ratio (FAR):**

> **FAR = False Alarms ÷ ( Hits + False Alarms )**

| Symbol | Definition |
|---|---|
| False Alarms | Number of events where rainfall was forecast but not observed |
| FAR | Perfect score = 0; No skill = 1 |

**Critical Success Index (CSI, Threat Score):**

> **CSI = Hits ÷ ( Hits + Misses + False Alarms )**

| Symbol | Definition |
|---|---|
| CSI | Combines POD and FAR; ranges from 0 (no skill) to 1 (perfect) |

**Equitable Threat Score (ETS):**

> **ETS = ( Hits − Hits_random ) ÷ ( Hits + Misses + False Alarms − Hits_random )**
> **Where: Hits_random = ( Hits + Misses ) × ( Hits + False Alarms ) ÷ N**
> **And N = Hits + Misses + False Alarms + Correct Rejections**

ETS corrects for the random chance of hitting the threshold and is the preferred metric for rare-event verification (heavy rainfall).

**Bias Score:**

> **Bias = ( Hits + False Alarms ) ÷ ( Hits + Misses )**

| Bias Value | Interpretation |
|---|---|
| Bias > 1 | Systematic over-forecast of rainfall events |
| Bias = 1 | Unbiased forecast |
| Bias < 1 | Systematic under-forecast of rainfall events |

**Mean Error (ME) / Bias:**

> **ME = ( 1 ÷ N ) × Σ ( Forecast_i − Observed_i )**

Positive ME indicates a systematic over-forecast of rainfall amounts; negative ME indicates under-forecast.

**Root Mean Square Error (RMSE):**

> **RMSE = √ ( ( 1 ÷ N ) × Σ ( Forecast_i − Observed_i )² )**

RMSE gives higher weight to large errors. It is most meaningful when compared against the sample standard deviation of the observed rainfall to assess forecast skill relative to climatological variability.

---

## **H.10 Area-Weighted Normal Formulas**

For completeness, the normal rainfall at State, Subdivision, and Region levels follows the same aggregation structure as the actual rainfall formulas, ensuring that departures are computed on a consistent basis.

**State Normal Rainfall:**

> **State Normal = Σ ( District_normal_period × District_area ) ÷ Σ ( District_area )**

Note: In practice, state-level normals are pre-stored directly in the `normal_state` table rather than recomputed from district-level normals at query time. The pre-stored values represent the area-weighted climatological normals computed during the normal-data preparation process.

**Subdivision Normal Rainfall:**

Pre-stored in the `normal_sub_division` table. The same special district codes (30506001 and 30506002) that are excluded from the actual rainfall area-weighting are also excluded from the subdivision normal computation.

**Region Normal Rainfall:**

Pre-stored in the `normal_region` table. The region normals represent the climatological average over the reference period, computed using subdivision-weighted averaging consistent with the H.4 aggregation formula.

**Country Normal Rainfall:**

Pre-stored in the `normal_country` table with country_name = 'INDIA'. The all-India normal is the long-period average computed from the reference period's complete dataset.

---

## **H.11 Season Boundary Formulas**

IMD defines four meteorological seasons with fixed calendar boundaries. These boundaries are used throughout iRAINS to determine which season a selected date falls within, to label seasonal aggregations, and to define the start and end dates for cumulative calculations.

| Season | Start Date | End Date | Duration (Approximate) |
|---|---|---|---|
| Winter | January 1 | February 28 (or Feb 29 in leap years) | 59–60 days |
| Pre-Monsoon | March 1 | May 31 | 92 days |
| Southwest Monsoon | June 1 | September 30 | 122 days |
| Post-Monsoon / Northeast Monsoon | October 1 | December 31 | 92 days |

**Season Determination Formula:**

Given a date d (expressed as month M and day DD):

> If M ∈ {1, 2} → Season = Winter
> If M ∈ {3, 4, 5} → Season = Pre-Monsoon
> If M ∈ {6, 7, 8, 9} → Season = SW Monsoon
> If M ∈ {10, 11, 12} → Season = Post-Monsoon

**Season Start Date Formula (for cumulative calculations):**

When a cumulative calculation is requested for a date d, the season start date S is determined from the season boundary for the season in which d falls. The cumulative period is then [S, d].

---

## **H.12 IMD Standard Week Boundary Formula**

IMD uses a non-standard weekly calendar in which each week begins on Thursday and ends on Wednesday. This convention is applied in the Rainfall Statistics (Weekly mode) and Rainfall Departures sections.

**Week Start Date Formula:**

Given a date d:
1. Determine the day of the week for d (Sunday = 0, Monday = 1, ..., Saturday = 6; Thursday = 4).
2. Compute: days_since_Thursday = (day_of_week(d) − 4 + 7) mod 7
3. Week Start = d − days_since_Thursday days
4. Week End = Week Start + 6 days

**Example:**
- d = Wednesday, June 12, 2024 (day = 3)
- days_since_Thursday = (3 − 4 + 7) mod 7 = 6
- Week Start = June 12 − 6 = June 6, 2024 (Thursday)
- Week End = June 6 + 6 = June 12, 2024 (Wednesday) ✓

**Season Week Count Formula:**

The number of complete IMD weeks within a season is:
> N_weeks = ⌊ ( Season_End_Date − Season_Start_Date + 1 ) ÷ 7 ⌋

For the SW Monsoon season (June 1–September 30 = 122 days), this yields ⌊122 ÷ 7⌋ = 17 complete weeks plus a partial final week (3 days), which is handled as a short partial week in the Rainfall Departures table.

---

# ***Appendix I: iRAINS Data Quality Framework*** {#appendix-i .unnumbered}

This appendix documents the data quality management framework within iRAINS — the systematic processes for identifying, flagging, correcting, and tracking data quality issues across the system.

---

## **I.1 Data Quality Objectives**

The iRAINS data quality framework is designed to meet the following objectives:

- **Completeness:** Ensure that all active stations submit daily observations with minimal gaps.
- **Accuracy:** Ensure that submitted values represent actual physical measurements within the plausible range for the station's climatological context.
- **Timeliness:** Ensure that data is submitted and verified within the daily operational cycle, before the cut-off used for report generation.
- **Consistency:** Ensure that aggregated values at higher geographic levels are consistent with the individual station readings from which they are derived.
- **Traceability:** Ensure that every data change is recorded in the audit log with the responsible user and timestamp.

These objectives are consistent with the data quality principles of the World Meteorological Organization (WMO) and IMD's internal data management standards.

---

## **I.2 Automated Quality Checks**

iRAINS applies the following automated quality checks at the point of data entry:

### **Range Check**

| Check | Condition | Action |
|---|---|---|
| Non-numeric entry | Entry cannot be parsed as a number | Reject with validation error message |
| Negative value (non-sentinel) | Entry < 0 and ≠ −999.9 | Reject with validation error message |
| Extreme positive value | Entry > 2000 mm | Display warning — user must confirm to save |
| Zero rainfall | Entry = 0 | Accept; treated as "no rain observed" |
| No-data sentinel | Entry = −999.9 | Accept; treated as "observation not collected" |

The 2000 mm threshold for the extreme positive value warning is set conservatively above the highest recorded single-day station rainfall in India (over 900 mm at Cherrapunji and similar high-rainfall stations). This threshold may be adjusted by the system administrator for specific extreme stations.

### **Station Code Validation (Bulk Upload)**

| Check | Condition | Action |
|---|---|---|
| Station code format | Must be exactly 13 digits | Reject row |
| Station code existence | Must match a record in station_details | Reject row with "Station not found" |
| Centre assignment | Station must belong to the uploading user's centre | Reject row with "Station not assigned to your centre" |

### **Date Validation**

| Check | Condition | Action |
|---|---|---|
| Future date | Entry date > today's date | Reject with "Future date not allowed" |
| Date format | Must parse as a valid calendar date | Reject with format error |

---

## **I.3 Manual Quality Review**

Automated checks catch format and range errors but cannot detect meteorologically implausible values that are numerically valid. For example, a reading of 120 mm during a dry December at an arid station is not caught by automated checks because 120 mm is a valid rainfall amount, even though it is highly unusual for that station in that month.

Manual quality review is the primary mechanism for catching such anomalies. The two-stage verification workflow — MC entry followed by HQ verification — creates a natural checkpoint for manual review. HQ meteorologists performing verification are expected to:

1. **Compare with surrounding stations:** The Nearby Station Comparison tool in the Station Statistics section allows rapid comparison of a flagged station's value against its neighbours.
2. **Compare with climatological context:** An experienced meteorologist can recognise implausibly high values during dry periods or implausibly zero readings during active monsoon phases.
3. **Cross-reference with synoptic analysis:** The HQ forecaster performing verification has access to the current day's synoptic analysis and can judge whether reported rainfall amounts are consistent with the known weather systems affecting the area.

When a value is identified as suspect, the HQ meteorologist contacts the responsible MC centre to confirm the reading, request re-measurement from the station observer, or request a correction if an entry error occurred.

---

## **I.4 Calculation Exclusions**

When a station, block, or district is identified as producing systematically unreliable data over an extended period, it can be flagged in the `calculation_exclusions` table by an HQ administrator. Excluded entities are filtered out before any aggregation calculation is performed.

### **Exclusion Types**

| Exclusion Type | Effect |
|---|---|
| Station exclusion | The specific station's readings are excluded from all district and higher-level aggregations |
| Block exclusion | All stations within the specified block are excluded |
| District exclusion | All stations within the specified district are excluded |

### **Exclusion Lifecycle**

1. HQ administrator identifies a problematic station, block, or district through operational monitoring or user reports.
2. Administrator adds a record to `calculation_exclusions` with the entity type, entity code, start date, and reason for exclusion.
3. From the start date, the excluded entity's data is filtered out before all aggregation queries.
4. When the data quality issue is resolved (instrument repaired, observer training completed, anomaly source removed), the administrator sets an end date for the exclusion record.
5. From the end date, the entity's data is again included in aggregations.
6. All exclusion records are retained permanently for audit purposes.

### **Impact on Reports**

When a calculation exclusion is active for a district, the district's data appears as "No Data" in all visualisation and report modules — even if station readings have been submitted for that district. This prevents unreliable data from influencing aggregated statistics at the state, subdivision, region, or country level. Reports generated while an exclusion is active will not reflect the excluded entity's readings.

---

## **I.5 Data Correction Workflow**

When an error is discovered in previously submitted data, the following process applies:

1. **Detection:** The error may be identified during HQ verification, by a centre noticing an incorrect entry, by a user reviewing the Rainfall Statistics output, or through the neighbouring station comparison in Station Statistics.
2. **Contact:** The MC or RMC responsible for the affected station is contacted to confirm whether the original reading was an entry error or whether the physical measurement needs to be rechecked.
3. **Re-entry:** The correcting user (MC staff) navigates to the Data Entry section, selects the date of the original entry, locates the station, and enters the corrected value. The upsert operation overwrites the old value. If the record had already been verified, the is_verified flag is cleared automatically.
4. **Re-verification:** After correction, the HQ meteorologist re-verifies the corrected value.
5. **Audit Trail:** The Data Actions log records both the original value (as an update from the old value) and the new value, with timestamps and user identifiers for each action.
6. **Report Regeneration:** If the corrected data materially affects a report that has already been distributed, the HQ administrator regenerates the report and redistributes it with a note indicating that it supersedes the earlier version.

---

## **I.6 Data Completeness Monitoring**

Station data completeness is monitored daily through the Verification HQ section. The following completeness metrics are tracked:

| Metric | Description | Target |
|---|---|---|
| Daily Submission Rate | Percentage of active stations that submitted data for the day | ≥ 90% |
| Centre Submission Rate | Percentage of a centre's assigned stations that submitted data | ≥ 85% per centre |
| Verification Completion Rate | Percentage of submitted data that has been verified by HQ | 100% by end of day |
| Late Submission Rate | Percentage of stations submitting after the 07:50 UTC cut-off | Minimize |

HQ meteorologists review these metrics each morning as part of the daily data management cycle. Centres with persistent low submission rates are flagged for follow-up by the HQ Data Management Officer.

---


# ***Appendix J: iRAINS Integration Architecture and External Interfaces*** {#appendix-j .unnumbered}

This appendix describes how iRAINS interfaces with external systems and data sources — the inputs it consumes, the outputs it produces, and the integration patterns used to exchange data with other components of IMD's data management infrastructure.

---

## **J.1 Data Inputs to iRAINS**

iRAINS receives data from two categories of external sources: meteorological observation data submitted by operational users, and pre-computed reference data loaded at system setup.

### **J.1.1 Station Rainfall Observations**

The primary operational data input to iRAINS is daily rainfall observations from IMD's meteorological station network. These observations flow into iRAINS through two channels:

**Manual Entry Channel:** MC and RMC staff enter observations directly through the Data Entry module's web interface. This channel accommodates all station types (ORG, ARG, AWS) and supports both real-time and late-entry corrections.

**Bulk Upload Channel:** For centres where data is initially aggregated in spreadsheet format, observations are entered into the Excel template and uploaded via the Bulk Upload function. The server-side ingest process validates and persists the data to the same `station_daily_data_updates` table as manual entries.

**Future Integration Consideration:** Automatic ingestion of AWS (Automatic Weather Station) data from IMD's central AWS database could be implemented as a scheduled backend process, reducing the manual data entry burden for centres with large AWS station networks. Such integration would require a standardised data exchange format (e.g., a REST API or SFTP-based file transfer from the AWS central server) and an automated ingestion script on the iRAINS server.

### **J.1.2 Climatological Normal Rainfall Data**

The pre-stored normal rainfall values that serve as the reference baseline for all departure calculations in iRAINS are loaded at system setup from IMD's official climatological dataset. These values represent long-period averages computed from historical records over the official IMD reference period (currently 1961–2010 for most products).

The data is loaded into the normal tables (`normal_district`, `normal_state`, `normal_sub_division`, `normal_region`, `normal_country`) through a one-time database load process using standardised CSV files or direct database inserts prepared by IMD's climate data management team. The loading process is performed by the system administrator during initial deployment and when IMD officially updates the normal rainfall values (which occurs infrequently, typically following the completion of a new 30-year reference period).

### **J.1.3 Geographic Boundary Data**

Administrative boundary shapefiles for Districts, States, Subdivisions, Blocks, and Homogeneous Regions are loaded into the iRAINS system and used by the Leaflet mapping library to render choropleth maps. The boundary data is maintained in the application's static asset directory as GeoJSON files, derived from India's official administrative boundary dataset.

The `normal_district_details` table stores structured geographic metadata — district codes, state codes, subdivision codes, region codes, geographic area values, and subdivision weights — that drives the multi-level aggregation calculations. This table is populated at system setup and updated when administrative boundary changes occur (e.g., new districts created by state government notification).

### **J.1.4 NWP Forecast Products**

NWP forecast map images are generated by IMD's modelling infrastructure (WRF ARW, IMD GFS, NCUM, GEFS, NEPS, and other models) and placed into the iRAINS NWP assets directory by the NWP ingestion pipeline. iRAINS does not process or transform the NWP output data — it serves the pre-generated image files as-is. The interface between IMD's NWP production system and iRAINS is the shared file system directory defined by the `NWP_ASSETS_PATH` configuration parameter.

### **J.1.5 QPF Verification Report Documents**

QPF Verification Report PDFs are prepared by Flood Meteorological Offices and uploaded to the iRAINS QPF assets directory by the system administrator. This is a manual process with no automated pipeline.

---

## **J.2 Data Outputs from iRAINS**

iRAINS produces several categories of output for consumption by users and external systems.

### **J.2.1 PDF Reports**

PDF documents generated by the Rainfall Reports and QPF Verification Report sections are produced on demand and delivered to the requesting user's browser. These documents are not stored on the server — each request triggers fresh computation and PDF assembly. If archival storage of generated reports is required, users must download and retain the files locally.

### **J.2.2 Excel / XLSX Exports**

Excel workbooks generated by the Rainfall Statistics, Rainfall Departures, Significant Rainfall, Yearly Station Statistics, and Log Info sections are produced on demand and delivered to the browser. Like PDF reports, these are not retained on the server.

### **J.2.3 Map Image Exports**

Map images exported from the Rainfall Map, Spatial Distribution, Monsoon Activity, and Station Statistics sections are generated using the `html-to-image` library on the client side. The image is captured from the rendered DOM element and downloaded as a PNG file. The export is entirely client-side and does not require server interaction.

### **J.2.4 Email Dissemination**

The Dissemination module sends emails with attachments to configured recipient groups using the Nodemailer SMTP service. All sent emails are logged in the `email_log` table. iRAINS does not maintain a copy of sent email bodies or attachments beyond the log record — attachments are assembled at send time and not retained.

### **J.2.5 REST API Responses**

The iRAINS backend exposes a RESTful API consumed exclusively by the iRAINS Angular frontend. The API is not currently designed as a public or third-party integration API. However, with appropriate authentication and authorization controls, individual API endpoints could be made available to other IMD systems (e.g., IMD's public data portal, state disaster management authority systems) to provide programmatic access to iRAINS's aggregated rainfall data.

---

## **J.3 Authentication and Session Management**

iRAINS uses JSON Web Token (JWT) authentication for all API calls. The authentication flow is:

1. User submits username and password to `/api/auth/login`.
2. Server validates credentials against the `login` table using bcrypt comparison.
3. On successful validation, the server signs a JWT containing the user's role, username, and centre code, and returns it to the browser.
4. The Angular frontend stores the JWT in localStorage and includes it as a `Bearer` token in the `Authorization` header of every subsequent API request.
5. The backend JWT middleware validates the token signature and expiry on every incoming request. Expired or invalid tokens result in HTTP 401 responses.
6. On logout, the frontend clears the JWT from localStorage. No server-side session invalidation is required (stateless JWT model).

---

## **J.4 Inter-Module Data Dependencies**

The iRAINS modules share a common data foundation but operate independently. The following dependencies exist between modules:

| Consuming Module | Depends On | Dependency Nature |
|---|---|---|
| Rainfall Map | Data Entry (station data), Normal Tables | Primary data source |
| Dashboard | Data Entry (station data), Normal Tables | Primary data source |
| Rainfall Graphs | Normal Tables, Aggregated Region Data | Data source |
| Rainfall Statistics | Data Entry (via aggregation), Normal Tables | Computed data |
| Rainfall Departures | Data Entry (via aggregation), Normal Tables | Computed data |
| Spatial Distribution | Data Entry (station count per area) | Computed data |
| Monsoon Activity | Spatial Distribution (previous day result), Data Entry | Computed data, inter-day dependency |
| Data Entry | Station Details (metadata), Calculation Exclusions | Metadata source |
| Verification HQ | Data Entry (is_verified flag) | Data Entry output |
| Verification MC | Data Entry (is_verified flag) | Data Entry output |
| Station Statistics | Data Entry (station data), Normal Tables, Station Details | Multiple sources |
| Yearly Station Statistics | Data Entry (historical data), Station Details | Historical data |
| Log Info | All modules (via audit tables) | Audit trail |
| Dissemination | Rainfall Reports, Rainfall Map, Spatial Distribution (export outputs) | Indirect |

The Monsoon Activity module has an inter-day dependency — it requires the previous day's spatial distribution classification in addition to the current day's data. This is the only module that depends on data from a prior day's computation.

---

## **J.5 IMD Data Standards Compliance**

iRAINS is designed to comply with the following IMD and WMO data standards:

**Rainfall Unit:** Millimetres (mm) as the primary storage and calculation unit, consistent with WMO and IMD standards for liquid precipitation measurement.

**Observation Timing:** Daily rainfall totals correspond to the 24-hour period ending at 07:50 UTC (observation time standard for the standard IMD observation network).

**Missing Data Representation:** The value −999.9 is used as the standard missing data sentinel, consistent with IMD's legacy data management conventions. This ensures compatibility with any data exchange with IMD's legacy systems.

**Climatological Reference Period:** Normal rainfall values use the 1961–2010 reference period, consistent with IMD's current operational standard for rainfall normals. When IMD adopts the 1991–2020 reference period for updated normals, the normal tables will be updated accordingly.

**Geographic Codes:** District codes, state codes, subdivision codes, and region codes follow IMD's standard coding conventions, ensuring consistency with other IMD data management systems.

**Station Codes:** The 13-digit hierarchical station code follows IMD's standard station identification convention.

---

# ***Appendix K: iRAINS System Design Principles and Architecture Rationale*** {#appendix-k .unnumbered}

This appendix documents the design decisions made in the development of iRAINS — the rationale behind the technology choices, architectural patterns, and data model design. This information is intended for system architects, senior developers, and technical administrators who need to understand the foundational principles of the system in order to maintain, extend, or integrate it.

---

## **K.1 Single-Page Application Architecture**

iRAINS is built as a Single-Page Application (SPA) using Angular 16. In a SPA, the web browser loads the application once and subsequently renders all views by manipulating the DOM dynamically, without full page reloads. Communication with the server occurs exclusively through asynchronous HTTP API calls.

**Rationale:** The SPA architecture was chosen for iRAINS because:

- **Interactive maps require a persistent DOM:** Leaflet maps are rendered in the browser DOM. Full page reloads would destroy the map state (zoom level, current layer, user interactions) on every navigation action, creating a poor user experience for a map-intensive application.
- **Complex state management:** iRAINS maintains significant application state — the selected date, geographic level, user filters, current section, and partially entered data. A SPA's component-level state management (via Angular's services and reactive patterns) handles this more cleanly than server-rendered page templates.
- **Reduced server load:** By performing view rendering on the client, the Angular SPA reduces the server's rendering workload. The server's Node.js process handles only data retrieval and computation, not HTML generation.

---

## **K.2 RESTful API Design**

The iRAINS backend exposes a RESTful HTTP API organized around rainfall data resources. Each resource category (rainfall data, statistics, station management, verification, etc.) has its own URL namespace. Standard HTTP methods (GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for deletion) are used consistently.

**Rationale:** REST was chosen over alternatives (GraphQL, gRPC, WebSockets) because:

- **Simplicity:** REST APIs are straightforward to implement with Express and are well-understood by all web developers.
- **Cacheability:** GET requests for aggregated rainfall data can be cached by the browser or an intermediate proxy, reducing redundant database load for repeated queries of the same data.
- **HTTP semantics:** Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500) communicate API outcomes clearly without requiring custom protocol design.
- **Tool ecosystem:** REST APIs are compatible with the full range of HTTP tools used in development (curl, Postman, browser dev tools) without requiring specialised clients.

---

## **K.3 PostgreSQL as the Database Engine**

The iRAINS data model is implemented in PostgreSQL, a mature, open-source relational database management system.

**Rationale:**

- **Multi-level aggregation with SQL:** The complex multi-level aggregation queries (station → district → state → region → country) are expressed naturally in SQL using GROUP BY, conditional aggregation, and window functions. PostgreSQL's SQL engine executes these queries efficiently with appropriate indexes.
- **ACID compliance:** PostgreSQL's full ACID transactional support ensures that concurrent data entry from multiple MC centres does not result in inconsistent database state.
- **JSON support:** PostgreSQL's native JSON/JSONB support allows semi-structured metadata to be stored alongside relational data without requiring a separate NoSQL store.
- **Geospatial extensions (PostGIS):** While iRAINS uses GeoJSON for client-side boundary rendering, PostGIS could be enabled in future to support server-side geospatial queries (e.g., "find all stations within a polygon drawn by the user") directly in the database, offloading this computation from the Node.js application layer.
- **Cost and licensing:** PostgreSQL is open-source and license-free, consistent with the project's deployment in a government setting.

---

## **K.4 Upsert Pattern for Data Entry**

All data entry operations in iRAINS use the PostgreSQL `INSERT ... ON CONFLICT DO UPDATE` (upsert) pattern rather than separate INSERT and UPDATE operations.

**Rationale:** The upsert pattern was chosen because:

- **Idempotent re-entry:** If an MC user clicks Save twice (accidentally), or if a bulk upload file includes duplicate rows, the second write overwrites the first without creating duplicate records. This prevents data corruption without requiring the application to first check whether a record exists.
- **Late corrections:** When data is corrected after initial entry, the correcting user simply re-enters the value. The system applies it without the user needing to specify whether they are creating or updating — the database handles the logic transparently.
- **Atomic operation:** A single SQL statement handles both the insert and update case, eliminating the race condition that would exist between a separate existence check and subsequent insert/update in a concurrent multi-user environment.

---

## **K.5 Client-Side Category Classification**

While the backend computes actual, normal, and departure values, the classification of departure percentages into the seven IMD categories (LE, E, N, D, LD, NR, ND) is performed on the frontend in the Angular application for most modules, rather than in the database or the backend API.

**Rationale:**

- **Display flexibility:** The category classification is used exclusively for display colouring and label assignment in the UI. Performing it in the Angular component allows the display logic to be updated (e.g., changing threshold values, adding new categories) without requiring backend API changes.
- **Reduced API payload:** Performing classification server-side would require returning category codes alongside numeric values in every API response. Keeping classification client-side reduces the size of API response payloads, which is relevant when fetching data for hundreds of districts.
- **Consistency for exports:** For PDF and Excel exports, category codes are applied in the same Angular service functions that handle UI display, ensuring that exported documents use identical categorisation logic to what is displayed on screen.

**Exception:** The Monsoon Activity classification is performed server-side in the backend controller because it involves complex multi-variable logic (rainfall ratio, spatial distribution, heavy-rain counts, previous day's data) that cannot practically be implemented in a simple Angular filter.

---

## **K.6 Server-Side PDF Generation**

PDF report generation in iRAINS uses the jsPDF library, called server-side within the Node.js backend rather than client-side in the browser.

**Rationale:**

- **Complex multi-page layouts:** jsPDF allows precise control over multi-page PDF layout, hierarchical table formatting, cell colour coding, and custom IMD header/footer placement. This level of control is difficult to achieve with CSS-print or browser-native PDF export.
- **Consistent output:** Server-side generation ensures that PDF documents are identical regardless of the browser, operating system, and screen resolution of the requesting user. Client-side PDF generation would produce output that varies across browsers.
- **Large dataset handling:** District-level reports for all of India may contain several hundred rows. Generating this in the browser would block the UI thread for several seconds. Server-side generation allows the computation to run in the background on the server while the browser remains responsive.

---

## **K.7 Stateless JWT Authentication**

iRAINS uses stateless JWT authentication rather than session-based authentication with server-side session storage.

**Rationale:**

- **Horizontal scaling:** In a stateless architecture, any server instance can handle any request from any user, because user authentication state is encoded in the JWT itself. This allows the application to be scaled across multiple server instances behind a load balancer without requiring shared session storage.
- **Reduced database load:** Session-based authentication requires a database lookup on every request to validate the session. JWT validation is performed cryptographically on the server using the JWT secret, with no database query required.
- **Standard compatibility:** JWT is a widely supported open standard (RFC 7519), compatible with standard HTTP libraries and testing tools.

---

## **K.8 Component-Based Angular Architecture**

The iRAINS Angular frontend is organized into independent Angular components corresponding to each system section. Each component is a self-contained unit managing its own view template, data bindings, and local state.

**Rationale:**

- **Independent development and testing:** Team members can develop and test individual sections independently without affecting other parts of the application.
- **Code maintainability:** Changes to one section's UI or logic are contained within that section's component files, reducing the risk of regressions in other sections.
- **Lazy loading:** Angular's router supports lazy loading of component modules, meaning that the code for sections not yet visited by the user is not downloaded until needed. This reduces the initial application load time, which is important for users on lower-bandwidth connections.
- **Shared services:** Common functionality — date formatting, rainfall category classification, geographic filter state, authentication state — is implemented as Angular injectable services shared across all components. This ensures consistency of shared logic without code duplication.

---

## **K.9 Leaflet for Interactive Maps**

iRAINS uses the Leaflet.js mapping library for all interactive map components.

**Rationale:**

- **Lightweight and open-source:** Leaflet is significantly lighter than Google Maps, Mapbox, or ArcGIS JavaScript API, with a smaller JavaScript bundle size. This matters for performance in bandwidth-constrained environments.
- **GeoJSON native support:** Leaflet natively supports GeoJSON, which is the format in which iRAINS's boundary files are stored. Adding and styling GeoJSON polygon layers in Leaflet requires minimal code.
- **Plugin ecosystem:** The leaflet-draw plugin provides polygon and rectangle drawing tools used in the Station Statistics section. Leaflet's extensive plugin ecosystem provides additional capabilities (marker clustering, heat maps, image overlays) that may be used in future enhancements.
- **License:** Leaflet is released under the BSD 2-Clause License, permitting use in government and commercial applications without licensing fees.

---

## **K.10 html-to-image for Client-Side Map Export**

Map images in iRAINS are exported using the `html-to-image` JavaScript library, which renders a DOM element (the Leaflet map container) to a PNG image.

**Rationale:**

- **Captures the rendered map:** Unlike server-side map generation (which would require rendering Leaflet in a headless browser), `html-to-image` captures the map exactly as displayed in the user's browser, including the current zoom level, active layers, colour scale, and any user-applied filters.
- **No server round-trip:** Map export is entirely client-side, requiring no server processing. This keeps the export operation fast and independent of server load.
- **Cross-browser support:** The library uses HTML Canvas to render the export, which is supported across all modern browsers.

---


# ***Appendix L: iRAINS User Training Guide*** {#appendix-l .unnumbered}

This appendix provides a structured training programme for new iRAINS users. It is organized into role-specific learning paths and covers the essential tasks that each user type needs to perform confidently before operating the system independently.

---

## **L.1 Training Programme Overview**

The iRAINS training programme is structured around three user profiles:

| Profile | Role in iRAINS | Primary Sections Used | Recommended Training Duration |
|---|---|---|---|
| Data Entry Operator (MC/RMC) | Enters and manages daily station data | Data Entry, Verification MC | 4 hours |
| Operational Meteorologist (HQ/MC) | Monitors rainfall, prepares bulletins, disseminates products | Rainfall Map, Dashboard, Rainfall Statistics, Rainfall Departures, Significant Rainfall, Spatial Distribution, Monsoon Activity, NWP Products, Rainfall Graphs, Dissemination | 8 hours |
| HQ Administrator | Manages stations, verifies data, reviews logs | Verification HQ, Data Entry (Station Management), Log Info | 4 hours |

All users should complete Module 1 (System Overview and Navigation) before proceeding to their role-specific modules.

---

## **L.2 Module 1: System Overview and Navigation (All Users — 1 Hour)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Log in to iRAINS and understand the role-based access model.
- Navigate between the eighteen main sections using the sidebar menu.
- Understand the difference between operational data (entered daily) and reference data (pre-loaded normals and boundaries).
- Identify the key interface elements common to multiple sections: date selectors, geographic level selectors, map controls, and export buttons.
- Log out of the system.

### **Training Content**

**1.1 System Login**

Open the iRAINS application in a web browser. The login page shows two input fields: Username and Password. Enter the credentials provided by your HQ administrator. The system validates your credentials and, if successful, loads the main application and directs you to the Dashboard view.

After login, your role and centre assignment are displayed in the top navigation bar. Your role determines which sections you can access and what actions you can perform. If the display does not match your expected role and centre, contact your HQ administrator immediately.

**1.2 Main Navigation**

The left sidebar contains the complete list of iRAINS sections, organized in operational order:
- Visualization sections (Rainfall Map, Dashboard, Rainfall Graphs, NWP Products)
- Statistical analysis sections (Rainfall Statistics, Rainfall Departures, Spatial Distribution, Monsoon Activity)
- Archive sections (QPF Verification Report, Rainfall Reports, Station Statistics, Yearly Station Statistics)
- Operational sections (Data Entry, Significant Rainfall, Verification HQ / MC)
- Administrative sections (Log Info, Dissemination)

Click any section name to navigate to it. Sections your role cannot access are greyed out and non-clickable.

**1.3 Common Controls**

Most iRAINS sections share the following controls:

- **Date Selector:** Click the date field to open a calendar picker. Use the left and right arrows to navigate months. Click a date to select it. Some sections (Rainfall Departures, Rainfall Reports) show a date range with two separate selectors.
- **Geographic Level Selector:** A dropdown control allowing selection of the administrative level at which data is aggregated and displayed. Options typically include Country, Region, State, Subdivision, and District.
- **Export / Download Button:** Identified by a download icon or "Export" label. Clicking generates the appropriate PDF, Excel, or image file and prompts the browser to download it.
- **Apply / Load / View Button:** In sections where data is not loaded automatically, this button triggers the data retrieval after filters are set.

---

## **L.3 Module 2: Data Entry and Station Management (Data Entry Operators — 2 Hours)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Use the station filter panel to locate assigned stations.
- Enter daily rainfall observations for individual stations.
- Upload bulk data using the Excel template.
- Identify and understand common validation error messages.
- Review submission status in the Verification MC section.

### **Training Content**

**2.1 Accessing the Data Entry Section**

Navigate to the Data Entry section from the left sidebar. The section opens with the station filter panel on the left and an empty station table on the right. Before data can be entered, filters must be set to retrieve the relevant stations.

**2.2 Applying Station Filters**

In the filter panel:
1. Select your **Region** from the dropdown. This restricts the station list to stations within the selected meteorological homogeneous region.
2. Select your **Centre** (your MC or RMC code). For MC and RMC users, this is pre-filled and cannot be changed.
3. Select the **State** relevant to today's data entry.
4. Optionally select a specific **District** to further narrow the table.
5. Ensure the **Date** is set to today's date (the default).
6. Click **Apply** or **Load**.

The station table populates with all active stations matching your selected filters and centre assignment.

**2.3 Entering Individual Station Data**

In the station table, each row represents one station. The rightmost column, labelled "Today's Rainfall (mm)", contains an editable input field. Click in the field for the relevant station and type the observed rainfall amount.

Guidelines for entry values:
- Enter 0 (zero) if the station observed no rainfall (rain gauge empty).
- Enter the measured amount in millimetres if rainfall was recorded (e.g., 12.5 for 12.5 mm).
- Leave the field blank if no observation was collected (station offline, observer absent, instrument malfunction).

After entering all values for the visible stations, click the **Save** button at the bottom of the table. A success notification confirms that the data was saved. If any validation errors occurred, an error summary is displayed listing the station codes and error descriptions.

**2.4 Bulk Upload**

If your centre's data is prepared in spreadsheet format, use the Bulk Upload feature for faster entry.

Step 1: Download the template file by clicking the **Download Template** button. The template is an Excel file (.xlsx) containing columns for Station Code, Station Name, Date, and Rainfall (mm), pre-filled with your centre's station codes.

Step 2: Open the template in Microsoft Excel or a compatible application. Enter the date and rainfall values in the appropriate columns. Leave the Rainfall cell blank for stations with no observation.

Step 3: Save the completed file as .xlsx format.

Step 4: Return to iRAINS and navigate to the Bulk Upload panel. Drag the completed file into the upload area or click the upload button to browse for the file. Click **Upload**.

Step 5: Review the processing summary. Successful rows are confirmed; error rows are listed with their station codes and error descriptions. Correct errors and re-upload if necessary.

**2.5 Checking Submission Status**

After completing data entry, navigate to the **Verification MC** section. The summary counters at the top show:
- **Updated:** Number of your stations with data saved for today.
- **Pending:** Number of your stations with no data saved for today.
- **Verified:** Number verified by HQ.
- **Not Verified:** Number submitted but not yet reviewed by HQ.

Your goal is for the **Pending** count to be zero and for the **Updated** count to match the total number of active stations assigned to your centre. If the Pending count is higher than expected, return to Data Entry to identify and complete any missing entries.

---

## **L.4 Module 3: Rainfall Monitoring (Operational Meteorologists — 3 Hours)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Use the Dashboard to assess the national rainfall picture at a glance.
- Navigate the Rainfall Map to drill down from country level to district level.
- Interpret departure colours and departure percentage values correctly.
- Use the Rainfall Graphs section to assess seasonal context.
- Use the Rainfall Statistics section to generate and export tabular summaries.
- Use the Rainfall Departures section to read the weekly departure matrix.

### **Training Content**

**3.1 Morning Monitoring Routine**

iRAINS supports a structured morning monitoring routine that typically takes 15–30 minutes. This routine covers:

1. Open the **Dashboard**. Review the national departure percentage and the choropleth map at Subdivision level. Note any regions showing Large Deficient or Large Excess. Review the Top 5 station marquee for any unusually high readings that warrant further investigation.

2. Navigate to the **Rainfall Map**. Select Departure as the map type. Navigate through State, Subdivision, and District levels to build a spatial picture of the day's rainfall distribution. Note any areas with persistent grey (No Data) that may indicate submission delays.

3. If a significant regional anomaly is visible in the map (e.g., persistent orange/yellow across a specific subdivision cluster), navigate to the **Rainfall Departures** section and select the current season to review whether this is a one-day occurrence or part of a longer-term pattern.

4. Check the **Rainfall Statistics** section for the current date at Subdivision level. Use this table as the basis for the daily morning briefing or bulletin preparation.

**3.2 Seasonal Context Analysis**

When preparing medium-term outlook materials or monthly assessments:

1. Open **Rainfall Graphs**. Select the current season and region. Review the cumulative actual versus normal trend. Identify whether the season is currently running ahead of or behind normal.

2. Return to **Rainfall Departures**. Review the full weekly departure matrix for the season. Identify subdivisions with consistently Deficient or Large Deficient categories across multiple weeks.

3. Open **Spatial Distribution**. For any week of concern, check whether the low departure corresponded to Isolated or Scattered spatial distribution (suggesting that rainfall was limited to a small fraction of the area) or to Fairly Widespread coverage with below-normal amounts (suggesting widespread but suppressed rainfall).

---

## **L.5 Module 4: Monsoon Activity Monitoring (Operational Meteorologists — 2 Hours)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Use the Spatial Distribution section to assess the coverage of rainfall.
- Use the Monsoon Activity section to identify active, vigorous, normal, weak, and subdued conditions.
- Interpret the colour-coded Monsoon Activity map correctly.
- Identify and explain the two-day rule for Subdued monsoon classification.

### **Training Content**

**4.1 Spatial Distribution Assessment**

1. Navigate to the **Spatial Distribution** section.
2. Select today's date and the **Subdivision** level.
3. Review the map. Areas in blue (Widespread) indicate strong monsoon coverage. Areas in bright green (Isolated) indicate very patchy rainfall.
4. Download the distribution table for use in the morning briefing.

**4.2 Monsoon Activity Classification**

1. Navigate to the **Monsoon Activity** section.
2. Select today's date. The map displays the activity classification for each subdivision.
3. Red areas (Vigorous) indicate the strongest monsoon conditions — high rainfall ratio plus widespread coverage and heavy-rain stations. Orange areas (Active) indicate good but not extreme monsoon activity. Green areas (Normal) represent typical monsoon conditions. Yellow areas (Weak) flag below-normal conditions. Grey areas (Subdued) indicate two consecutive days of Isolated or Scattered coverage with a rainfall ratio below 1.0.
4. Download the tabular summary and the map image for inclusion in the operational record.

**4.3 Interpreting Vigorous vs. Active**

The distinction between Vigorous and Active is important for official bulletins:

- **Vigorous** indicates a very active monsoon with rainfall more than four times the normal, widespread coverage, and at least one station recording extremely heavy rainfall (>80 mm in the classified region). This classification warrants strong monsoon warnings and should be highlighted in any public forecast.
- **Active** indicates a healthy, active monsoon with rainfall 1.5 to 4 times the normal and some heavy-rainfall stations. This is the typical characterisation for a well-performing active monsoon phase.

---

## **L.6 Module 5: HQ Verification and Administration (HQ Administrators — 2 Hours)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Use Verification HQ to review and verify submitted station data.
- Perform bulk verification efficiently.
- Use the Log Info section to investigate data quality issues.
- Add, edit, and disable station records in the Station Management interface.
- Manage user accounts.

### **Training Content**

**5.1 Daily Verification Procedure**

1. Navigate to **Verification HQ**.
2. Review the daily summary table. Identify any MCs or RMCs with a high Pending count or a zero Updated count — these centres may need follow-up.
3. For centres that have submitted data, click the drill-down arrow to expand the centre's station table.
4. Review individual station values. Compare unusual values against neighbouring stations using the **Nearby Stations** tab available from within the verification table.
5. For stations that appear valid, click the Verify button or select multiple stations and use Bulk Verify.
6. Continue until all submitted data has been verified.

**5.2 Investigating a Data Quality Issue**

1. Navigate to **Log Info**.
2. Select the **Data Actions** tab.
3. Enter the relevant station code and date range in the filter panel.
4. Review the action log for the station. If multiple inserts or updates are shown, the most recent value is the current database value.
5. If necessary, contact the responsible MC to request a correction or confirmation.

**5.3 Adding a New Station**

1. Navigate to **Data Entry**, then open the **Station Management** tab.
2. Click **Add Station**.
3. Enter all required fields: Station Code (13-digit hierarchical code), Station Name, Station Type, Latitude, Longitude, Elevation, State, District, Block, and Centre Code.
4. Click Save. Verify that the new station appears in the station table.
5. Confirm with the assigned MC that the station is visible in their Data Entry section.

---

## **L.7 Module 6: Report Generation and Dissemination (Operational Meteorologists — 1 Hour)**

### **Learning Objectives**
By the end of this module, the trainee should be able to:
- Generate PDF rainfall reports for any date range and geographic level.
- Download and review the generated PDF before distribution.
- Use the Dissemination section to send email reports to recipient groups.
- Review the email log to confirm successful dispatch.

### **Training Content**

**6.1 Generating a Rainfall Report**

1. Navigate to the **Rainfall Reports** section.
2. Set the **From Date** and **To Date** using the date selectors. For the daily morning report, set both dates to yesterday.
3. Select the **Geographic Level**: District, State, Subdivision, Region, or Country as appropriate.
4. Click **View**. The system generates the report and displays it inline in the PDF viewer.
5. Scroll through the report to verify completeness and accuracy.
6. Click **Download** to save the PDF.

**6.2 Sending via the Dissemination Module**

1. Navigate to the **Dissemination** section.
2. Select the recipient group from the **To** dropdown (e.g., "State DMAs — All India").
3. Enter or select the email subject (e.g., "Daily Rainfall Report — [Date]").
4. Type the email body text.
5. Under **Attachments**, locate and select the report PDF you previously generated and downloaded. Additional attachments (departure maps, Monsoon Activity maps) can also be added.
6. Click **Send**.
7. Navigate to the **Email Log** tab to confirm the email appears as "Sent" with the correct recipient group, timestamp, and attachment list.

---

# ***Appendix M: iRAINS System Reference — Normal Rainfall Tables*** {#appendix-m .unnumbered}

This appendix describes the structure, purpose, and maintenance of the normal rainfall reference tables that form the baseline for all departure calculations in iRAINS.

---

## **M.1 Purpose of Normal Rainfall Tables**

The normal rainfall tables in iRAINS store the pre-calculated long-period average rainfall values for each geographic unit (district, state, subdivision, region, country) for each calendar day. These values represent the historical average rainfall that would be expected on any given day of the year in any given area, based on the official IMD climatological reference period.

When a user requests rainfall departure data for any period, iRAINS computes:
1. **Actual Rainfall:** Aggregated from station observations through the multi-level aggregation pipeline.
2. **Normal Rainfall:** Summed directly from the pre-stored daily normal values for the selected unit and date range.
3. **Departure:** Computed from the ratio of actual to normal.

The quality and accuracy of the normal rainfall tables directly determines the accuracy of all departure calculations and classifications in the system.

---

## **M.2 Normal Table Structure**

Each normal table (at each geographic level) stores one record per geographic unit per calendar date. The structure is uniform across all levels:

**District-Level Normal Table (`normal_district`):**

| Field | Type | Description |
|---|---|---|
| `id` | Integer (auto-increment) | Primary key |
| `district_code` | Character | Unique district identifier code |
| `date` | Date | Calendar date (typically stored as day-of-year for the reference year) |
| `rainfall_value` | Numeric | Long-period average rainfall in millimetres for this district on this date |

**State-Level Normal Table (`normal_state`):**

| Field | Type | Description |
|---|---|---|
| `state_code` | Character | State identifier |
| `date` | Date | Calendar date |
| `rainfall_value` | Numeric | Long-period average rainfall for the state on this date |

**Subdivision-Level Normal Table (`normal_sub_division`):**

| Field | Type | Description |
|---|---|---|
| `subdiv_code` | Character | IMD subdivision identifier |
| `date` | Date | Calendar date |
| `rainfall_value` | Numeric | Long-period average rainfall for the subdivision on this date |

**Region-Level Normal Table (`normal_region`):**

| Field | Type | Description |
|---|---|---|
| `region_code` | Character | IMD homogeneous region identifier |
| `date` | Date | Calendar date |
| `rainfall_value` | Numeric | Long-period average rainfall for the region on this date |

**Country-Level Normal Table (`normal_country`):**

| Field | Type | Description |
|---|---|---|
| `country_name` | Character | 'INDIA' |
| `date` | Date | Calendar date |
| `rainfall_value` | Numeric | All-India long-period average rainfall on this date |

---

## **M.3 Reference Period and Data Sources**

The current normal rainfall values in iRAINS are based on the **1961–2010 reference period** — the 50-year climatological baseline officially adopted by IMD for rainfall normal calculations. This is the same reference period used for computing the Long Period Average (LPA) of the All-India Summer Monsoon Rainfall (currently 880.6 mm, as published by IMD).

The daily normal values were derived from IMD's gridded historical rainfall dataset by computing spatial averages over each district, state, subdivision, region, and the national domain for each calendar date, then averaging across all 50 years in the reference period.

For seasonal comparisons in the Rainfall Graphs section, the normal values represent the expected average daily rainfall for that region on each day of the season, accumulated across the entire season. When cumulative lines are shown in the graphs, the cumulative normal at any point in the season equals the sum of daily normal values from the season start to that date.

---

## **M.4 Updating Normal Rainfall Tables**

The normal rainfall tables are static reference data that should not be modified during routine system operation. They are updated only when:

1. **IMD officially revises its climatological normal period:** When the WMO and IMD adopt a new standard reference period (e.g., 1991–2020), the system administrator must replace the values in all normal tables with the newly computed averages for the new reference period.

2. **Errors are identified in the existing normal data:** In rare cases, an arithmetic error or data preparation error in the original normal dataset may be discovered through quality review. In such cases, only the affected unit/date records are corrected.

The update process involves:
1. Preparing updated CSV files with the correct normal values for all affected units and dates.
2. Running a database load script that updates the affected records in the normal tables.
3. Clearing any cached aggregation results that may have used the old normal values.
4. Notifying all system users that normal values have been updated and that previously generated reports may show slightly different departure values from reports regenerated after the update.

---

## **M.5 Normal Data Quality Checks**

Before deploying updated normal rainfall data, the following quality checks should be performed:

| Check | Description | Expected Outcome |
|---|---|---|
| Completeness | Every district/state/subdivision/region has a value for every calendar date (366 dates for leap-year calendar) | Zero missing records |
| Non-negative values | All normal rainfall values are ≥ 0 | No negative normals |
| Seasonal consistency | Normals in the monsoon season (Jun–Sep) are higher than in the winter (Jan–Feb) for monsoon-dominated districts | Expected seasonal pattern |
| District-state consistency | Sum of area-weighted district normals approximately equals state normals | Within 5% tolerance |
| Subdivision-region consistency | Weighted average of subdivision normals approximately equals region normals | Within 5% tolerance |
| All-India total | Sum of region-weighted normals approximately equals published LPA (880.6 mm) for the Monsoon season | Within 2% of published value |

---

# ***Appendix N: Glossary of Terms*** {#appendix-n .unnumbered}

This glossary defines the key meteorological, statistical, and technical terms used throughout the iRAINS documentation and system interface. Terms are organized alphabetically within thematic groups.

---

## **N.1 Meteorological Terms**

| Term | Definition |
|---|---|
| **Active Monsoon** | A phase of the SW or NE Monsoon characterized by rainfall 1.5× to 4× the long-period normal, typically associated with an intensified monsoon trough south of its normal position and strengthened low-level westerly winds. |
| **Break Monsoon** | A period during the monsoon season when the monsoon trough shifts northward to the Himalayan foothills, causing suppressed rainfall over central and peninsular India while heavy rain falls over the foothills and NE India. Typically lasts 5–15 days. |
| **Convection** | Vertical atmospheric motion driven by instability, typically producing cumulonimbus clouds and intense localized rainfall. Deep convection indicates a well-developed convective system extending to high altitudes. |
| **Cyclonic Storm** | A tropical cyclone with maximum sustained surface wind speed between 63 km/h and 88 km/h. The most intense storms can bring catastrophic rainfall to coastal regions. |
| **Depression** | A synoptic-scale low-pressure system with maximum sustained surface wind speed between 31 km/h and 61 km/h, typically forming over the Bay of Bengal. Depressions are the primary rain-bearing systems of the Indian monsoon, contributing approximately 50% of seasonal monsoon rainfall. |
| **Drought (Meteorological)** | A condition in which seasonal rainfall falls below 75% of the long-term average. Classified as Moderate (deficit 26–50%) or Severe (deficit >50%). |
| **El Niño** | The warm phase of the El Niño–Southern Oscillation (ENSO) cycle, characterized by anomalously warm sea surface temperatures in the central and eastern equatorial Pacific. El Niño years are frequently associated with below-normal SW Monsoon rainfall over India. |
| **Flash Flood** | A rapid onset flood occurring within six hours of the causative rainfall event. Associated with intense localized convection, orographic rainfall, and dam/levee failures. |
| **Indian Ocean Dipole (IOD)** | An irregular oscillation of sea surface temperatures in the Indian Ocean. A positive IOD (warm western Indian Ocean, cool eastern) can partially offset the suppressive effect of El Niño on the Indian monsoon. |
| **La Niña** | The cool phase of ENSO, characterized by anomalously cool sea surface temperatures in the central and eastern Pacific. La Niña years are frequently associated with above-normal SW Monsoon rainfall over India. |
| **Long Period Average (LPA)** | The average rainfall over a region for a given interval, computed over a 30–50 year reference period. The IMD LPA for all-India SW Monsoon rainfall (June–September) is **880.6 mm** based on the 1961–2010 reference period. Equivalent to "Normal Rainfall" in the departure calculation. |
| **Low-Pressure Area (LPA)** | A synoptic weather system with maximum wind speeds below 31 km/h. Less organized than a depression but can trigger significant rainfall. |
| **Madden Julian Oscillation (MJO)** | A global-scale, eastward-propagating pattern of enhanced and suppressed tropical convection with a 30–60 day period. MJO is the dominant driver of active/break cycles in the Indian monsoon at sub-seasonal timescales. |
| **Monsoon Onset** | The official IMD declaration of the start of the SW Monsoon over Kerala, typically occurring around 1 June. Declared when three simultaneous conditions are met: sustained rainfall at 60% of specified Kerala stations for two days, westerly wind field up to 600 hPa, and OLR < 200 W/m² in the specified box. |
| **Monsoon Trough** | An elongated zone of low pressure extending from the heat low over Pakistan to the Head Bay of Bengal. The position and strength of the trough is the most important determinant of day-to-day monsoon rainfall distribution. |
| **Monsoon Withdrawal** | The official IMD declaration of the retreat of the SW Monsoon, beginning from NW India around 1 September and completing over the southern tip of the peninsula by mid-October. |
| **Normal Rainfall** | See Long Period Average (LPA). In iRAINS, stored as pre-computed daily values for each geographic unit and each calendar date. |
| **Northeast Monsoon (NE Monsoon)** | The winter monsoon affecting Tamil Nadu, Andhra Pradesh, and southeastern India during October–December, driven by northeasterly winds over the Bay of Bengal. |
| **OLR (Outgoing Longwave Radiation)** | Infrared radiation emitted by the Earth's surface and atmosphere. Low OLR values indicate deep convective cloud tops (active convection); high OLR indicates suppressed convection. Used as a criterion for monsoon onset over Kerala. |
| **Orographic Rainfall** | Rainfall caused by the forced ascent of moist air over elevated terrain (mountains). Responsible for extremely heavy rainfall on the windward slopes of the Western Ghats during the SW Monsoon. |
| **Southwest Monsoon (SW Monsoon)** | The primary rainy season of India, driven by southwesterly winds off the Arabian Sea and the Bay of Bengal. Covers June–September; contributes approximately 75–80% of India's annual rainfall. |
| **Subdued Monsoon** | A period of suppressed monsoon rainfall activity with weakened monsoon circulation. Distinct from break monsoon — subdued conditions can occur without the classical break-monsoon trough configuration. |
| **Vigorous Monsoon** | A phase of the monsoon characterized by rainfall exceeding 4× the long-period normal, with strong low-level winds and deep convection. Associated with well-organized monsoon lows or depressions. |
| **Weak Monsoon** | A phase of the monsoon characterized by rainfall less than half (< 0.5×) the long-period normal. |

---

## **N.2 Rainfall Classification and Statistical Terms**

| Term | Definition |
|---|---|
| **Actual Rainfall** | The observed rainfall recorded by rain gauge stations and aggregated to the geographic level of interest using the iRAINS weighted-average pipeline. |
| **Cumulative Rainfall** | Total rainfall accumulated from the start of a season or specified period to the current date. Used for season-to-date performance assessment. |
| **Deficient** | IMD departure category for actual rainfall between −20% and −59% of the long-period normal. |
| **Departure** | The percentage deviation of actual rainfall from the normal (long-period average): Departure (%) = (Actual − Normal) ÷ Normal × 100. Positive values indicate excess; negative values indicate deficit. |
| **Excess** | IMD departure category for actual rainfall between +20% and +59% above the long-period normal. |
| **Fairly Widespread** | Spatial distribution category for 51%–74% of stations in a unit reporting rainfall. |
| **Isolated** | Spatial distribution category for 11%–25% of stations in a unit reporting rainfall. |
| **Large Deficient** | IMD departure category for actual rainfall between −60% and −99% of the long-period normal. |
| **Large Excess** | IMD departure category for actual rainfall ≥ +60% above the long-period normal. |
| **No Rain (NR)** | A special departure category where actual rainfall is exactly zero (−100% departure). Distinct from No Data. |
| **No Data (ND)** | Condition where no valid rainfall observations are available for a geographic unit and time period. Stations with value −999.9 are treated as missing. |
| **Normal** | IMD departure category for actual rainfall between −19% and +19% of the long-period normal. Also used generically to refer to the long-period average value itself. |
| **Rainfall Ratio (R)** | The ratio of actual rainfall to normal rainfall: R = Actual ÷ Normal. Used as the primary input to the monsoon activity classification algorithm. |
| **Scattered** | Spatial distribution category for 26%–50% of stations in a unit reporting rainfall. |
| **Sentinel Value (−999.9)** | A special numeric code used in iRAINS to indicate that no observation is available for a station on a given date. All calculations treat −999.9 values as null/missing. |
| **Widespread** | Spatial distribution category for ≥75% of stations in a unit reporting rainfall. |

---

## **N.3 Technical and System Terms**

| Term | Definition |
|---|---|
| **Angular** | The open-source TypeScript-based frontend framework (version 16) used to build the iRAINS single-page application. |
| **API (Application Programming Interface)** | The set of HTTP endpoints provided by the iRAINS Node.js backend that the Angular frontend calls to retrieve and submit data. |
| **Area-Weighted Average** | The aggregation method used to compute state and subdivision rainfall from district-level values: Σ(district rainfall × district area) ÷ Σ(district area). Ensures that larger districts contribute proportionally more to the aggregate. |
| **bcrypt** | A cryptographic hash function used in iRAINS to securely store user passwords. Passwords are never stored in plain text. |
| **Choropleth Map** | A thematic map where geographic areas are shaded or coloured according to a statistical variable (e.g., rainfall departure category). Used in iRAINS for the Rainfall Map, Dashboard, Spatial Distribution, and Monsoon Activity modules. |
| **CTE (Common Table Expression)** | A PostgreSQL SQL construct used in iRAINS to generate date series and perform complex multi-step aggregations in a single query. |
| **GeoJSON** | An open standard format for encoding geographic data structures as JSON. Used in iRAINS to define the polygon boundaries of districts, states, and subdivisions for map rendering. |
| **Haversine Formula** | A mathematical formula for computing the great-circle distance between two points on a sphere given their latitudes and longitudes. Used in the Station Statistics module to find stations within a specified radius. |
| **Highcharts** | A JavaScript charting library used in iRAINS to render interactive line charts, column charts, and pie charts in the Rainfall Graphs, Monsoon Activity, and Station Statistics modules. |
| **HTML-to-Image** | A JavaScript library that renders a DOM element as a high-resolution bitmap image. Used in iRAINS to capture Leaflet map canvases for JPEG and PDF download functionality. |
| **jsPDF** | A JavaScript library for generating PDF documents in the browser. Used in iRAINS for client-side PDF generation of maps and summary tables. |
| **JWT (JSON Web Token)** | A compact, self-contained token format used for authentication in iRAINS. After login, the server issues a JWT that the client stores in localStorage and includes in the Authorization header of subsequent API requests. |
| **Leaflet.js** | An open-source JavaScript library for interactive web maps. Used in iRAINS for all map-based modules (Rainfall Map, Dashboard, Spatial Distribution, Monsoon Activity, Station Statistics). |
| **Moment.js** | A JavaScript date/time manipulation library used in iRAINS for date formatting, season boundary calculations, and week number computations. |
| **Node.js** | The JavaScript runtime environment used to execute the iRAINS backend server (Express application). |
| **NULLIF** | A PostgreSQL function returning NULL if two values are equal. Used in iRAINS to prevent division by zero when computing area-weighted averages (e.g., NULLIF(SUM(district_area), 0)). |
| **ON CONFLICT DO UPDATE (Upsert)** | A PostgreSQL INSERT statement clause that updates existing rows rather than failing if a duplicate key is encountered. Used in iRAINS for all rainfall data writes to ensure idempotent saves. |
| **PostgreSQL** | The relational database management system used by iRAINS to store all operational data including station observations, normal values, user accounts, and audit logs. |
| **PrimeNG** | An Angular UI component library providing data tables, dropdown menus, calendars, and dialog boxes used throughout the iRAINS interface. |
| **Shapefile** | A geospatial vector data format (ESRI Shapefile). The boundary data used in iRAINS was originally sourced from shapefiles and converted to GeoJSON for web delivery. |
| **Station Code (13-digit)** | A hierarchical station identifier in iRAINS encoding Region (1 digit), Subdivision (2 digits), State (2 digits), District (3 digits), Block (2 digits), and Station (3 digits) in sequence. |
| **Subdiv Weight** | A pre-calculated weighting factor stored in `normal_district_details.subdiv_weight` used when aggregating subdivision rainfall to the region level. Proportional to the subdivision's area within the region. |
| **Turf.js** | A JavaScript geospatial analysis library. Used in iRAINS Station Statistics to determine which stations fall inside a user-drawn polygon using the `booleanPointInPolygon` function. |
| **Upsert** | See ON CONFLICT DO UPDATE. |
| **xlsx-js-style** | An extended SheetJS library supporting styled Excel export. Used in iRAINS Yearly Station Statistics and Verification HQ for Excel downloads with formatted headers and coloured cells. |

---

## **N.4 IMD Organizational and Geographic Terms**

| Term | Definition |
|---|---|
| **DVC (Damodar Valley Corporation)** | A public sector flood control and power generation authority managing the Damodar River basin in West Bengal and Jharkhand. One of the QPF verification report categories in iRAINS. |
| **FMO (Flood Meteorological Office)** | Specialized IMD offices responsible for issuing QPF and flood meteorological services for major river basins. One of the QPF verification report categories in iRAINS. |
| **HQ (Headquarters)** | The highest-authority user role in iRAINS, corresponding to IMD Headquarters (New Delhi). HQ users have full national data access and administrative capabilities. |
| **IMD (India Meteorological Department)** | The National Meteorological and Hydrological Service of India, under the Ministry of Earth Sciences. Responsible for weather observation, forecasting, and climatological data management. |
| **IRU (IMD RIMES Unit)** | The IMD RIMES Unit responsible for developing and maintaining the iRAINS platform. |
| **IST (Indian Standard Time)** | India's time zone, UTC+5:30. All operational times in iRAINS (data entry cutoffs, update cycles, reminder emails) are expressed in IST. |
| **MC (Meteorological Centre)** | Regional IMD offices that supervise one or more states. MC users in iRAINS enter and verify data for the stations within their jurisdiction. |
| **RIMES (Regional Integrated Multi-Hazard Early Warning System)** | A regional intergovernmental organisation supporting early warning systems for hydro-meteorological hazards in the Asia-Pacific region. |
| **RMC (Regional Meteorological Centre)** | Senior regional IMD offices with a coordination role above MCs. RMC users in iRAINS have the same data entry and verification permissions as MC users but may have wider geographic scope. |
| **SP (Special Profile)** | A restricted read-only role in iRAINS for users who need to view data across the system without the ability to enter, verify, or manage data. |
| **Subdivision** | IMD's primary meteorological geographic unit for monsoon monitoring. India is divided into 36 meteorological subdivisions, each encompassing one or more districts. Normal rainfall and departure statistics are computed and published at subdivision level for operational bulletins. |

---

# ***Appendix O: Troubleshooting Guide*** {#appendix-o .unnumbered}

This guide provides solutions for common issues encountered by iRAINS users. Issues are grouped by functional area.

---

## **O.1 Login and Access Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Login page shows "Invalid username or password" | Incorrect credentials entered | Verify that Caps Lock is off; check username spelling; request password reset from HQ administrator if forgotten |
| Page loads but user is immediately logged out | JWT token has expired | Log in again; tokens expire after 8 hours of inactivity |
| User can log in but cannot access certain sections | User role does not have permission for that section | Contact HQ administrator to verify the user's assigned role (`hq`, `mc`, `rmc`, or `sp`) in the `login` table |
| "Access denied" message on a download button | The user's role does not have download permissions | Guest/SP roles have limited download access; contact HQ administrator |
| Login page does not load at all | Server may be unavailable | Check network connectivity; contact system administrator to verify server status |

---

## **O.2 Data Entry Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Station does not appear in the station table | Station not assigned to this user's centre, or station is inactive | Verify station assignment in the Station Management panel (HQ only); check `is_active` status |
| Cannot save a rainfall value | Value may be outside the valid range, or session has expired | Ensure value is 0–999.9 mm; log out and log in again if session expired; check network connectivity |
| Uploaded Excel file is rejected | File format mismatch or missing required columns | Download the official template from the Bulk Upload panel and re-enter data in the correct format; ensure station codes match the expected 13-digit format |
| Station shows as "Updated" but value appears wrong | Previous user or automated process may have saved an incorrect value | Edit the value directly in the inline table; the upsert mechanism will overwrite the previous value |
| Data entry date selector is limited to 60 days ago | This is a system design feature for MC/RMC users | For historical corrections beyond 60 days, contact HQ to perform the correction through the HQ administrator interface |
| −999.9 appears in cells after upload | The template contained empty cells in the data column | Empty cells in the upload template default to −999.9 (no observation). Review the template for blank cells before uploading |
| "Duplicate station in file" error during upload | Multiple rows in the Excel file have the same station code | Ensure each station code appears exactly once per upload file |

---

## **O.3 Map and Visualization Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Map does not render / shows blank | Browser incompatibility or JavaScript error | Use a modern browser (Chrome 90+, Firefox 88+, Edge 90+); clear browser cache; check for JavaScript errors in browser console |
| GeoJSON boundary layers do not load | Slow network or server under load | Reload the page; if persistent, check network speed; GeoJSON files may be 5–15 MB and require adequate bandwidth |
| Districts appear in grey (No Data) when data exists | Station data not yet aggregated | Check the current time against the 11:30 IST initial update schedule; if after 11:30, wait for the next half-hourly refresh or contact HQ administrator |
| Map download (JPEG / PDF) produces a blank image | Browser security restriction preventing canvas capture | Ensure the browser allows cross-origin canvas access; disable ad-blockers if present; try downloading in an incognito window |
| Colour legend does not match expected categories | Browser zoom level is affecting CSS styles | Reset browser zoom to 100% (Ctrl+0 on Windows / Cmd+0 on Mac) and reload the page |
| Map controls (zoom, full screen) unresponsive | Leaflet map in an error state | Reload the page; if persistent, clear the browser's localStorage for the iRAINS domain |

---

## **O.4 Chart and Export Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Rainfall graph shows no data or flat lines | Data not yet submitted for the selected season/year | Verify in Data Entry or Verification MC that data exists for the selected date range; check that season and year are correctly selected |
| PDF export is blank or contains no data | Data was filtered out by the current selection | Ensure at least one geographic unit is selected and data exists for the selected period |
| Excel export is empty | No data matches the current filter | Adjust date range or geographic filter to include records with data |
| Excel download fails or triggers a browser security warning | Browser downloading settings | Allow downloads from the iRAINS domain in browser security settings; check browser download folder for a file that may have been blocked silently |
| Highcharts graph does not appear | JavaScript library not loaded (slow or failed network) | Reload the page; check browser network tab for failed JavaScript resource requests |

---

## **O.5 Email and Dissemination Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Emails are not delivered to recipients | Incorrect email address, or server email configuration issue | Verify recipient email addresses are correct; check the Email Log for error messages; contact administrator to verify Nodemailer SMTP configuration |
| Auto-email did not send on schedule | The Auto Email toggle may be set to Off, or the server-side cron job failed | Check the Auto Email toggle in the Dissemination section; HQ administrator should verify the cron job status on the server |
| Email received without attachment | Attachment generation failed (e.g., PDF generation error, file not found) | Contact HQ administrator to check the server logs for PDF generation errors |
| Recipient group is missing members | The recipient group may not have been updated | Review and update the recipient group in the Dissemination section |

---

## **O.6 Verification Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Station shows as "Not Updated" after data entry | The save did not complete — data was not persisted | Re-enter the value and ensure the save confirmation appears; check for network errors |
| "Verify" button is disabled for a station | Station does not have a submitted value to verify | Ensure MC has completed data entry for that station before attempting verification |
| Bulk verify reports partial success | Some stations in the selection had no submitted data | The system verifies only stations with a valid non-missing value; re-run bulk verify after all stations are updated |
| Verified station reverts to "Not Verified" | A new data entry was submitted after verification | Re-entering data clears the verification flag; the MC must re-verify or HQ must re-verify the corrected value |
| Verification HQ does not show all expected stations | Filter may be excluding some centres | Ensure no centre or region filter is applied; check that the selected date matches the data entry date |

---

## **O.7 Performance Issues**

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Pages load very slowly | Large dataset, slow network, or server under load | Reduce the date range or geographic scope of the query; avoid peak usage times; contact administrator if persistent |
| Station Statistics map is slow when zooming | Many station markers are rendered simultaneously | Use the administrative filter to limit the number of stations displayed; avoid loading all-India station markers simultaneously |
| Yearly Station Statistics takes a long time to generate | Large date range or large station count | Limit the date range to the required period; use the filter to select a specific state or district before downloading |
| Browser tab becomes unresponsive | Memory-intensive operation (e.g., rendering thousands of map markers) | Close unused browser tabs; use the filter to reduce the geographic scope before loading |

---

# ***Appendix P: Quick Reference Card for Daily Operational Use*** {#appendix-p .unnumbered}

This appendix is a compact reference guide designed for operational forecasters and data managers. It summarises the most frequently used values, thresholds, and procedures in iRAINS.

---

## **P.1 Daily Update Schedule at a Glance**

| Time (IST) | Event | Action Required |
|---|---|---|
| 08:30 | Data entry window opens | MC users begin entering previous day's observations |
| 11:00 | Reminder emails sent | Centres that have not submitted are notified automatically |
| 11:30 | First daily aggregation | All submitted data visible across platform for first time |
| 11:30 onwards | Half-hourly refresh | Late entries incorporated every 30 minutes |
| 13:20 (07:50 UTC) | Report data snapshot | Data frozen for auto-generated daily reports |
| End of day | Final state | All submitted and verified data reflected in historical record |

---

## **P.2 Departure Category Quick Reference**

| Category | Code | Departure Range | Colour |
|---|---|---|---|
| Large Excess | LE | ≥ +60% | Dark Green |
| Excess | E | +20% to +59% | Light Green |
| Normal | N | −19% to +19% | White/Neutral |
| Deficient | D | −20% to −59% | Light Red/Pink |
| Large Deficient | LD | −60% to −99% | Dark Red |
| No Rainfall | NR | −100% (Actual = 0) | Brown/Tan |
| No Data | ND | No valid data | Grey |

---

## **P.3 Monsoon Activity Quick Reference**

| Category | Rainfall Ratio (R) | Description |
|---|---|---|
| Vigorous | R > 4.0 | More than 4× normal; deep convection |
| Active | 1.5 ≤ R ≤ 4.0 | 1.5–4× normal; wind intensification |
| Normal | 0.5 ≤ R < 1.5 | Half to 1.5× normal |
| Weak | R < 0.5 | Less than half of normal |
| Subdued | Special case | Suppressed circulation |

---

## **P.4 Spatial Distribution Quick Reference**

| Category | Stations Reporting Rain | Monsoon Significance |
|---|---|---|
| Dry | 0% – 10% | No monsoon activity |
| Isolated | 11% – 25% | Onset/withdrawal phase |
| Scattered | 26% – 50% | Break monsoon or weak phase |
| Fairly Widespread | 51% – 74% | Active monsoon |
| Widespread | ≥ 75% | Vigorous monsoon |

---

## **P.5 IMD Rainfall Intensity Classification (Station Level)**

| Classification | 24-Hour Rainfall | Alert Level |
|---|---|---|
| Trace | < 0.1 mm | No alert |
| Light Rain | 0.1 – 7.5 mm | Normal |
| Moderate Rain | 7.6 – 35.5 mm | Normal |
| Rather Heavy Rain | 35.6 – 64.4 mm | Green alert |
| Heavy Rain | 64.5 – 115.5 mm | Yellow alert |
| Very Heavy Rain | 115.6 – 204.4 mm | Orange alert |
| Extremely Heavy Rain | ≥ 204.5 mm | Red alert |

---

## **P.6 Season Boundaries Quick Reference**

| Season | Start Date | End Date | Primary Region |
|---|---|---|---|
| Winter | January 1 | February 28/29 | All India |
| Pre-Monsoon | March 1 | May 31 | South Peninsula, NE India |
| SW Monsoon | June 1 | September 30 | All India |
| Post-Monsoon / NE Monsoon | October 1 | December 31 | South India (NE Monsoon) |

---

## **P.7 Module Selection Guide**

| Operational Need | Primary Module | Supporting Module |
|---|---|---|
| Visualize yesterday's rainfall pattern | Rainfall Map | Dashboard |
| Check departure from normal at a glance | Dashboard | Rainfall Map |
| Assess this week's performance vs. normal | Rainfall Statistics | Rainfall Departures |
| Track cumulative season-to-date performance | Rainfall Departures | Rainfall Reports |
| Characterize monsoon activity for bulletin | Monsoon Activity | Spatial Distribution |
| Identify how widely rain was spread | Spatial Distribution | Monsoon Activity |
| Find stations with extreme rainfall | Significant Rainfall | Station Statistics |
| Review forecast skill for a river basin | QPF Verification Report | — |
| Generate formal PDF report for any period | Rainfall Reports | — |
| Enter or correct station data | Data Entry | Verification MC |
| Verify submitted data before publication | Verification MC | Verification HQ |
| View all stations on an interactive map | Station Statistics | Rainfall Map |
| Download station-date matrix for analysis | Yearly Station Statistics | — |
| Check NWP model rainfall forecasts | NWP Rainfall Products | — |
| Send rainfall products to stakeholders | Dissemination | — |
| Review audit trail of data changes | Log Info | — |

---

## **P.8 User Role Capability Summary**

| Capability | HQ | MC / RMC | SP / Guest |
|---|---|---|---|
| View all maps, charts, and tables | ✓ | ✓ | ✓ |
| Download PDFs and Excel files | ✓ | ✓ | Limited |
| Enter station rainfall data | ✓ | ✓ (own stations) | — |
| Upload bulk rainfall files | ✓ | ✓ (own stations) | — |
| Verify station data | ✓ (all) | ✓ (own stations) | — |
| Add / edit / delete stations | ✓ | — | — |
| Send dissemination emails | ✓ | ✓ | — |
| Manage recipient groups | ✓ | ✓ | — |
| Access audit Log Info | ✓ | ✓ | — |
| Manage user accounts | ✓ | — | — |
| Enter data beyond 60-day window | ✓ | — | — |

---

## **P.9 Key Database Tables Quick Reference**

| Table Name | Purpose | Primary Key |
|---|---|---|
| `station_daily_data_updates` | Current operational rainfall observations | `(station_id, collection_date)` |
| `station_details` | Station metadata (name, code, coordinates, district, MC) | `station_id` |
| `normal_district_details` | District geographic metadata including area and subdivision weights | `district_code` |
| `normal_district` | District-level long-period normal rainfall by date | `(district_code, date)` |
| `normal_state` | State-level long-period normal by date | `(state_code, date)` |
| `normal_sub_division` | Subdivision-level long-period normal by date | `(subdiv_code, date)` |
| `normal_region` | Region-level long-period normal by date | `(region_code, date)` |
| `normal_country` | Country-level long-period normal by date | `(country_name, date)` |
| `login` | User accounts with roles, centre codes, and hashed passwords | `username` |
| `station_logs` | Audit log of station metadata additions/edits/deletions | `id` |
| `data_actions` | Audit log of data entry and verification actions | `id` |

---

# ***Appendix Q: Station Network and Data Coverage*** {#appendix-q .unnumbered}

This appendix provides reference information on the structure of the IMD station network as represented in iRAINS, the categories of stations available, and the data coverage considerations that affect system outputs.

---

## **Q.1 Station Types in iRAINS**

iRAINS manages three principal types of rainfall measurement stations:

| Station Type | Code | Description | Data Entry Method |
|---|---|---|---|
| **IMD Observatory (ORG)** | ORG | Conventional manually observed station operated by IMD. Observers read the rain gauge at 08:30 IST for the previous 24-hour period and report to the local Meteorological Centre. | Manual entry via Data Entry section or bulk Excel upload |
| **Automatic Weather Station (AWS)** | AWS | Self-reporting electronic station transmitting data automatically. AWS data may be ingested via a separate automated pipeline; it is also accessible via the State AWS tab in Yearly Station Statistics. | Automated ingest or manual correction via Data Entry |
| **Automatic Rain Gauge (ARG)** | ARG | A sensor recording only rainfall (not the full suite of meteorological parameters). ARG data follows the same processing pipeline as AWS data within iRAINS. | Automated ingest or manual correction via Data Entry |

---

## **Q.2 Station Hierarchy and Code Structure**

Every station in iRAINS is assigned a unique 13-digit hierarchical station code. The code encodes the complete geographic hierarchy of the station:

| Position | Digits | Field | Description |
|---|---|---|---|
| 1 | 1 digit | Region | IMD region code (1 = South Peninsula, 2 = NW India, 3 = Central India, 4 = East & NE India) |
| 2–3 | 2 digits | Subdivision | IMD meteorological subdivision code (01–36) |
| 4–5 | 2 digits | State | State/UT code |
| 6–8 | 3 digits | District | District code within the state |
| 9–10 | 2 digits | Block | Administrative block within the district |
| 11–13 | 3 digits | Station | Individual station number within the block |

**Example:** Station code `1250301002001` decodes as Region 1 (South Peninsula) → Subdivision 25 (Madhya Maharashtra) → State 03 (Maharashtra) → District 01 (first district in state) → Block 002 → Station 001.

---

## **Q.3 National Station Coverage**

The iRAINS station network covers all 36 meteorological subdivisions and all major administrative districts across India. The following reference describes the approximate national coverage:

| Metric | Approximate Value |
|---|---|
| Total active IMD observatory stations | 3,500 – 4,000 |
| Total active AWS stations | 1,000 – 1,500 |
| Total active ARG stations | 500 – 800 |
| Number of IMD Meteorological Centres | 35 |
| Number of IMD meteorological subdivisions covered | 36 |
| Number of districts with at least one active station | >700 |
| Districts with multiple station types (ORG + AWS) | >200 |

---

## **Q.4 Data Completeness Expectations**

The following guidelines define expected data submission completeness for each operational stage of the daily cycle:

| Stage | Expected Completeness | Time (IST) |
|---|---|---|
| Before morning entry window | 0% (previous day's observations not yet entered) | Before 08:30 |
| Mid-morning entry | 40–60% of stations submitted | 09:30–10:30 |
| After reminder emails | 70–80% of stations submitted | 11:30 |
| Post half-hourly refresh cycle 1 | 85–90% of stations submitted | 12:00 |
| After report data cut-off | 90–95% of stations submitted | 13:20 |
| End of operational day | 95–99% of stations submitted | 17:00 |
| Next-day corrections (if any) | ≤ 5% of stations | Following morning |

Note: Completeness percentages are approximate national averages. Individual subdivisions or states may have higher or lower completeness depending on the local centre's operational capacity and connectivity conditions.

---

## **Q.5 Missing Data and Sentinel Value Policy**

A rainfall value of **−999.9** in any iRAINS table or export indicates that no observation was recorded for that station on that date. This is the universal sentinel value used throughout the system:

| Condition | Value in System | Treatment in Calculations |
|---|---|---|
| No observation submitted | −999.9 | Excluded from all averages; treated as missing |
| Station reported zero rainfall | 0.0 | Included in averages; counted in spatial distribution denominator |
| Station data rejected (quality flag) | −999.9 | Same as no observation |
| Observation pending verification | Actual value (e.g., 25.4) | Included in calculations regardless of verification status |

The distinction between 0.0 (no rain reported) and −999.9 (no report received) is significant for spatial distribution calculations. A station reporting 0.0 is counted as an active station with zero rainfall; a station with −999.9 is excluded from both the numerator and denominator of the spatial distribution percentage. This means that incomplete submission (many −999.9 stations) will reduce the apparent spatial distribution percentage even if the actual coverage was wider.

---

## **Q.6 Station Coordinates and Geographic Assignment**

Each station's geographic assignment is determined at the time of station registration in the `station_details` table. The following fields govern geographic classification:

| Field | Description | Used By |
|---|---|---|
| `station_lat` | Latitude in decimal degrees | Station Statistics map, Haversine radius search |
| `station_lon` | Longitude in decimal degrees | Station Statistics map, Haversine radius search |
| `district_code` | 13-digit district code linking to `normal_district_details` | All aggregation pipelines |
| `centre_code` | MC/RMC code to which the station is assigned | Verification access control |
| `station_type` | ORG / AWS / ARG | Yearly Station Statistics tab routing |
| `is_active` | Boolean: whether station is currently operational | Excluded from aggregation if inactive |

Stations that are decommissioned or temporarily non-operational should have `is_active` set to false. This prevents them from appearing in data entry tables and excludes them from spatial distribution denominators. The deactivation should be logged in the Station Log section for audit purposes.

---

# ***Appendix R: NWP Model Reference*** {#appendix-r .unnumbered}

This appendix provides technical reference information for the eight Numerical Weather Prediction (NWP) models available in the iRAINS NWP Rainfall Products section.

---

## **R.1 Model Descriptions**

| Model | Full Name | Developer / Operator | Type |
|---|---|---|---|
| **WRF ARW** | Weather Research and Forecasting – Advanced Research WRF | IMD / NCMRWF (run operationally over India) | Limited-Area Model (LAM) |
| **IMD GFS** | Global Forecast System (IMD version) | IMD | Global Model |
| **IMD GFS-BC** | GFS with Bias Correction | IMD | Global Model (post-processed) |
| **NCUM** | Unified Model (Non-hydrostatic Cumulus Model) | UK Met Office / IMD | Global Model |
| **NCUM-R 00Z** | NCUM Regional (00Z initialization) | IMD | Limited-Area Model |
| **NCUM-R 12Z** | NCUM Regional (12Z initialization) | IMD | Limited-Area Model |
| **GEFS** | Global Ensemble Forecast System | NOAA/NCEP | Global Ensemble |
| **NEPS** | National Ensemble Prediction System | IMD | National Ensemble |

---

## **R.2 Model Technical Specifications**

| Model | Horizontal Resolution | Vertical Levels | Domain | Forecast Range | Initialization |
|---|---|---|---|---|---|
| WRF ARW | ~12 km | 51 | South Asia | D+1 to D+5 | 00Z daily |
| IMD GFS | ~23 km (T574) | 64 | Global | D+1 to D+7 | 00Z daily |
| IMD GFS-BC | ~23 km | 64 | Global (India focus) | D+1 to D+7 | 00Z daily |
| NCUM | ~17 km | 70 | Global | D+1 to D+7 | 00Z daily |
| NCUM-R 00Z | ~4 km | 70 | South Asia | D+1 to D+3 | 00Z daily |
| NCUM-R 12Z | ~4 km | 70 | South Asia | D+1 to D+3 | 12Z daily |
| GEFS | ~55 km (T254) | 64 | Global | D+1 to D+16 | 00Z & 06Z & 12Z & 18Z |
| NEPS | ~23 km | 64 | Global (India focus) | D+1 to D+10 | 00Z daily |

---

## **R.3 Approximate Product Availability Times (IST)**

Model forecast images are generated after the model run completes and are transferred to the iRAINS server. The following table shows typical product availability times in IST for the standard 00Z initialization cycle:

| Model | 00Z Run Completion | Product Available on iRAINS (approx.) |
|---|---|---|
| WRF ARW | 05:30–07:00 IST | 07:00–09:00 IST |
| IMD GFS | 07:00–09:00 IST | 09:00–11:00 IST |
| IMD GFS-BC | 07:30–10:00 IST | 10:00–12:00 IST |
| NCUM | 06:00–08:00 IST | 08:00–10:00 IST |
| NCUM-R 00Z | 09:00–11:00 IST | 11:00–13:00 IST |
| NCUM-R 12Z | 21:00–23:00 IST (previous evening) | 23:00–01:00 IST |
| GEFS | 08:00–10:00 IST | 10:00–12:00 IST |
| NEPS | 09:00–12:00 IST | 12:00–14:00 IST |

Note: These are approximate times. Actual availability depends on model run completion, file transfer duration, and server ingestion schedule. If products are not visible for an expected date by the estimated time, administrators should verify the ingestion status as described in Appendix G.5.

---

## **R.4 View Types Available in iRAINS**

Each model's forecast products are available in two map types corresponding to different geographic sectoring:

| View Type | Description | Number of Maps |
|---|---|---|
| **MC (Meteorological Centre)** | Forecast maps sectored by IMD's Meteorological Centre boundaries. Shows rainfall distribution within each centre's operational domain. Typically 20–25 regional maps covering all of India. | ~20–25 images per day per model |
| **River Basin** | Forecast maps sectored by major river basins. Shows rainfall over specific drainage catchments. Used for flood forecasting and dam operation guidance. | ~30–40 images per day per model (covering all major basins) |

---

## **R.5 Probabilistic Products (PQPF)**

In addition to deterministic forecast maps, the iRAINS NWP Rainfall Products section provides Probabilistic Quantitative Precipitation Forecasts (PQPF) from the ensemble models GEFS and NEPS. PQPF maps show the probability (expressed as a percentage) that rainfall will exceed a specified threshold on a given forecast day.

**Available PQPF Thresholds:**

| Threshold | Meteorological Significance | Typical Operational Use |
|---|---|---|
| ≥ 1 mm/day | Any measurable rainfall | General precipitation probability |
| ≥ 5 mm/day | Light rain | Assessment of rain/no-rain probability |
| ≥ 25 mm/day | Moderate to rather heavy rain | Planning for significant rainfall events |
| ≥ 50 mm/day | Heavy to very heavy rainfall | Flood early warning; high-impact event planning |
| ≥ 100 mm/day | Extremely heavy rainfall | Extreme event probability; high-confidence alert triggers |

**Interpreting PQPF Maps:**

- A probability of **>70%** for a threshold indicates high model agreement — the event is likely to occur in that area.
- A probability of **30–70%** indicates moderate confidence — the event is possible but uncertain.
- A probability of **<30%** indicates the event is unlikely based on ensemble spread.

PQPF products are most reliable for D+1 to D+5. Beyond D+5, ensemble spread increases and probability values below 50% carry less operational significance.

---

## **R.6 Model Selection Guidance for Operational Forecasting**

| Scenario | Recommended Model(s) | Reasoning |
|---|---|---|
| Next-day heavy rainfall alert (D+1) | NCUM-R 00Z or NCUM-R 12Z | Highest resolution (4 km); best captures mesoscale rainfall features |
| Week-ahead monsoon outlook (D+4–D+7) | NCUM or IMD GFS | Medium-range reliability; global models capture large-scale systems |
| Heavy rainfall probability assessment | GEFS or NEPS (PQPF) | Ensemble spread provides uncertainty estimate; PQPF most actionable |
| River basin flood guidance | River Basin view of NCUM-R | High-resolution + catchment-specific view for dam operations |
| Cyclone track and rainfall | IMD GFS + NCUM | Global models track cyclone circulation better than LAMs |
| Pre-monsoon convective forecast (D+1–D+2) | WRF ARW | LAM handles convective initiation well at regional scale |
| Bias-corrected guidance for operations | IMD GFS-BC | Post-processed GFS reduces systematic wet/dry biases over specific regions |

---

## **R.7 Limitations and Caveats**

Users of the NWP Rainfall Products section should be aware of the following inherent limitations of NWP model guidance:

- **Spatial errors:** Even high-skill models may place the location of heavy rainfall events 50–150 km from the observed location. Use model output as a general indicator, not a precise location forecast.
- **Intensity underestimation:** All operational NWP models tend to underestimate extreme rainfall events (> 100 mm/day). PQPF products from ensemble models provide a probabilistic correction but do not eliminate this bias.
- **Orographic uncertainty:** Rainfall over the Western Ghats, Western Himalayas, and Northeast India is heavily orographic. Lower-resolution models (GFS, NCUM global) may significantly under-represent the total orographic enhancement.
- **Model spin-up:** The first few hours of any model forecast are affected by spin-up artifacts. D+1 products should be interpreted cautiously for lead times less than 12 hours.
- **Data latency:** Products visible in iRAINS represent the most recent successfully ingested model run. If a run failed or the file transfer was incomplete, the visible product may be from a previous cycle.

---

# ***Appendix S: iRAINS Data Flow Diagram Reference*** {#appendix-s .unnumbered}

This appendix provides a textual description of the major data flows within the iRAINS system, supporting system integration discussions and technical briefings.

---

## **S.1 Observation Data Flow (Station to National)**

The primary operational data flow in iRAINS follows a five-stage pipeline from raw station observations to all-India national statistics:

**Stage 1 — Station Observation**
Rain gauge observers at each IMD observatory station record the 24-hour accumulated rainfall at 08:30 IST. The reading covers the period from 03:00 UTC of the previous day to 03:00 UTC of the current day (equivalent to 08:30 IST the previous day to 08:30 IST the current day). AWS and ARG stations record automatically and transmit data electronically.

**Stage 2 — Data Entry and Upload**
MC and RMC users enter observations into iRAINS via the Data Entry section. Each save operation executes an upsert into `station_daily_data_updates` with the station code, date, and rainfall value. Bulk uploads from Excel files follow the same upsert pathway. The `data_actions` audit table logs every data entry or modification action with the user ID and timestamp.

**Stage 3 — District-Level Aggregation**
At 11:30 IST and every 30 minutes thereafter, the backend aggregation engine:
1. Queries `station_daily_data_updates` for all valid (non-−999.9, non-negative) observations for the target date.
2. Groups observations by district code.
3. Computes the arithmetic mean of valid station values within each district.
4. Stores the district mean as `daily_avg_rainfall` for that district and date.

**Stage 4 — Cumulative District Aggregation**
For multi-day periods (weekly, seasonal, cumulative), the district-level aggregation sums the daily average values across all days in the period:
`actual_district_rainfall = SUM(daily_avg_rainfall) for all days in period`

**Stage 5 — Upward Weighted Aggregation**
District-level values are aggregated to higher levels using the following methods:

| Target Level | Input Level | Method | Weight Variable |
|---|---|---|---|
| State | District | Area-weighted average | `district_area` from `normal_district_details` |
| Subdivision | District | Area-weighted average (with exceptions for districts 30506001, 30506002 using area=0) | `district_area` |
| Region | Subdivision | Subdivision-weighted average | `subdiv_weight` from `normal_district_details` |
| Country (India) | Region | Region-weighted average | `subdiv_weight` cascaded through regions |

---

## **S.2 Normal Rainfall Data Flow**

Normal rainfall values are static reference data loaded at system setup and updated only when IMD revises its official climatological reference values. The flow is:

1. IMD publishes official long-period average (LPA) values for each district, state, subdivision, region, and country for each calendar date.
2. These values are loaded into the corresponding normal tables (`normal_district`, `normal_state`, `normal_sub_division`, `normal_region`, `normal_country`).
3. For multi-day periods, normal values are summed: `normal_period = SUM(normal_value) for all dates in period`.
4. Departure is computed: `Departure (%) = (Actual − Normal) ÷ Normal × 100`.
5. The departure value is classified into one of seven categories (LE, E, N, D, LD, NR, ND).

---

## **S.3 Verification Data Flow**

The verification workflow operates on top of the observation data flow:

1. After data entry, each station record in `station_daily_data_updates` has `is_verified = 0` (unverified).
2. MC/RMC supervisors review the station-level data in Verification MC and click Verify for each confirmed observation.
3. When verification is triggered, the backend sets `is_verified = 1`, `verified_at = NOW()`, and `verified_by = userId` in the station record.
4. HQ users in Verification HQ can view all stations across India and perform national-scope bulk verification.
5. If a station's value is re-entered after verification, the `is_verified` flag resets to 0 and the station must be re-verified.

---

## **S.4 Report Generation Data Flow**

When a user requests a PDF report from the Rainfall Reports section:

1. The frontend sends the selected geographic level, start date, and end date to the backend.
2. The backend queries the relevant aggregation tables for actual and normal rainfall for each geographic unit in the specified level for each day in the date range.
3. Actual rainfall is summed across the date range to produce the period total; normal rainfall is similarly summed.
4. Departure is computed for each unit.
5. Departure values are classified into categories.
6. The backend renders the results table and map using jsPDF and Highcharts/Leaflet on the server side.
7. The completed PDF is returned to the browser as a binary download.

---

## **S.5 Email Dissemination Data Flow**

When a user composes and sends a rainfall report via the Dissemination section:

1. The user selects the report type, date range, geographic level, and recipient group.
2. The frontend requests the backend to generate the report attachment (same pipeline as S.4).
3. The backend assembles the email message with the PDF attachment using Nodemailer.
4. The email is sent via the configured SMTP server to all members of the selected recipient group.
5. All email dispatch events (timestamp, sender, recipients, subject, attachment name) are logged in the email log table.
6. For automated (scheduled) emails, the same pathway is triggered by the server-side cron job rather than by user action.

---

# ***Appendix T: IMD Geographic Reference*** {#appendix-t .unnumbered}

This appendix provides reference tables for IMD's administrative and meteorological geographic units as used in iRAINS.

---

## **T.1 IMD Region Reference**

IMD divides India into five administrative regions for meteorological operations. Region codes are used in station codes and in the NWP Rainfall Products view selector.

| Region Code | Region Name | States/UTs Covered (representative) |
|---|---|---|
| 1 | South Peninsula | Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, Goa |
| 2 | Northwest India | Rajasthan, Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Delhi |
| 3 | Central India | Madhya Pradesh, Chhattisgarh, Maharashtra, Gujarat, Vidarbha |
| 4 | East & Northeast India | West Bengal, Odisha, Bihar, Jharkhand, Assam, Meghalaya, Manipur, Nagaland, Mizoram, Tripura, Arunachal Pradesh, Sikkim |
| 5 | North India / Uttar Pradesh | Uttar Pradesh, Uttarakhand |

---

## **T.2 IMD Meteorological Centre Reference**

Each IMD Meteorological Centre (MC) is responsible for data entry and verification of stations within its jurisdiction. The following table lists the major Meteorological Centres:

| Centre Code | Centre Name | Primary State(s) / Region |
|---|---|---|
| MUM | Mumbai | Maharashtra |
| DEL | New Delhi | Delhi, Haryana, Punjab, Himachal Pradesh |
| CHE | Chennai | Tamil Nadu, Puducherry |
| CAL | Kolkata (Calcutta) | West Bengal, Sikkim |
| PAT | Patna | Bihar |
| BHU | Bhubaneswar | Odisha |
| HYD | Hyderabad | Telangana, Andhra Pradesh |
| BAN | Bengaluru | Karnataka |
| AHM | Ahmedabad | Gujarat |
| JAI | Jaipur | Rajasthan |
| LUC | Lucknow | Uttar Pradesh |
| GAU | Guwahati | Assam, Northeast India |
| BHO | Bhopal | Madhya Pradesh |
| RAI | Raipur | Chhattisgarh |
| RAN | Ranchi | Jharkhand |
| TRV | Thiruvananthapuram | Kerala, Lakshadweep |
| SRI | Srinagar | Jammu & Kashmir, Ladakh |
| CHA | Chandigarh | Punjab, Haryana, Chandigarh |
| JAB | Jabalpur | Madhya Pradesh (East) |
| NAG | Nagpur | Vidarbha |
| POR | Port Blair | Andaman & Nicobar Islands |
| IMI | Indian Meteorological Institute | Training / Pune |

---

## **T.3 IMD Standard Week Reference**

iRAINS uses the IMD standard meteorological week for all weekly aggregation and reporting. The week runs from **Thursday to Wednesday**.

| Week Reference | Start Day | End Day | Notes |
|---|---|---|---|
| IMD Standard Week | Thursday | Wednesday | 7-day week used for weekly bulletins |
| Calendar Week (ISO) | Monday | Sunday | NOT used in iRAINS |
| Annual week count | Week 1 starts first Thursday of January | — | Used internally for week-number labelling |

When a date is selected in iRAINS, the system automatically identifies the IMD standard week containing that date and computes aggregates for the full Thursday–Wednesday window. The **weekly mode** in Rainfall Statistics and Rainfall Departures uses this definition.

---

## **T.4 Key River Basins in NWP Products**

The River Basin view in the NWP Rainfall Products section provides forecast maps for India's major river basins. These basins are the primary units used for FMO operations and QPF verification. Key basins include:

| Basin | Primary State(s) | Associated FMO | Key Operational Concern |
|---|---|---|---|
| Ganga–Brahmaputra-Barak | UP, Bihar, West Bengal, Assam | Patna, Kolkata, Guwahati FMOs | Major flood risk; monsoon depression tracks |
| Brahmaputra | Assam, Arunachal Pradesh | Guwahati FMO | Extremely heavy rainfall; flash floods |
| Mahanadi | Odisha, Chhattisgarh | Bhubaneswar FMO | Bay of Bengal depression landfall |
| Godavari | Telangana, Andhra Pradesh, Maharashtra | Hyderabad FMO | Large catchment; monsoon low tracks |
| Krishna | Karnataka, Andhra Pradesh, Maharashtra | Hyderabad FMO | Significant agricultural and power generation dependence |
| Cauvery | Karnataka, Tamil Nadu | Bengaluru FMO | Inter-state water disputes; drought monitoring |
| Narmada | Madhya Pradesh, Gujarat | Bhopal FMO | Dam operations; flood forecasting |
| Tapi | Maharashtra, Gujarat | Mumbai FMO | Rapid-response floods; urban flooding in Surat |
| Damodar | West Bengal, Jharkhand | DVC (special case) | HPF-designated; DVC QPF verification programme |
| Indus (tributaries) | Punjab, Himachal Pradesh, J&K | Chandigarh FMO | Glacier-fed; snowmelt + monsoon flooding |

---

## **T.5 Special Districts — Subdivision Calculation Exception**

Two specific district codes use an area of zero in the subdivision area-weighted average calculation. This is a documented special case in the iRAINS calculation engine:

| District Code | District Name | Reason for Zero Area |
|---|---|---|
| 30506001 | Specified coastal district (Andaman) | Excluded from mainland subdivision calculation to avoid distorting subdivision area-weighted average due to remote island geography |
| 30506002 | Specified island district | Same reason — island districts are geographically isolated from the continental subdivision and use a weight of zero in the subdivision aggregation |

These districts still receive their own departure calculations using the standard district-level formula. The zero-weight exception applies only when their values would otherwise be incorporated into a mainland subdivision aggregate.

---

# ***Appendix U: Document Revision History*** {#appendix-u .unnumbered}

This appendix records the revision history of the iRAINS Technical Documentation.

---

## **U.1 Revision Log**

| Version | Date | Section(s) Changed | Change Description | Author |
|---|---|---|---|---|
| 1.0 | 2024-01-15 | All | Initial release of iRAINS technical documentation covering all 18 modules | IRU Technical Team |
| 1.1 | 2024-03-10 | Section 3 (Data Entry) | Added bulk upload section; Excel template format documented | IRU Technical Team |
| 1.2 | 2024-05-20 | Section 7 (QPF), Appendix H | Updated QPF verification metrics; added formula reference appendix | IRU Technical Team |
| 1.3 | 2024-07-08 | All Appendices | Added Appendices F through M covering FAQ, technical specs, formulas, data quality, integration, design principles, training guide | IRU Technical Team |
| 1.4 | 2024-09-15 | Section 1 (Introduction) | Added daily operational cycle section (11:30 IST update schedule, half-hourly refresh) | IRU Technical Team |
| 1.5 | 2024-11-01 | Appendices N–U | Added Glossary, Troubleshooting Guide, Quick Reference Card, Station Network reference, NWP Model reference, Data Flow diagrams, Geographic reference, Revision history | IRU Technical Team |
| 2.0 | 2025-01-01 | All | Major expansion to comprehensive operational reference document; target 10,000-line technical specification | IRU Technical Team |

---

## **U.2 Planned Future Revisions**

The following topics are identified for inclusion in future revisions of this document:

| Topic | Target Section | Priority | Status |
|---|---|---|---|
| AWS automatic ingestion pipeline documentation | Section 3 (Data Entry), Appendix S | High | Planned |
| Block-level aggregation detailed formula | Section 3.1, Appendix H | Medium | Planned |
| Polygon selection algorithm specification | Section 15 (Station Statistics) | Medium | Planned |
| Multi-year comparison feature documentation | Section 16 (Yearly Station Statistics) | Low | Planned |
| HTTPS and security configuration guide | Appendix G | High | Planned |
| Docker deployment instructions | Appendix G | Medium | Planned |
| API endpoint complete reference | New Appendix | High | Planned |

---

## **U.3 Document Distribution**

This technical document is distributed to:

| Recipient | Role | Distribution Method |
|---|---|---|
| IMD Hydromet Division, New Delhi | Operational owner | Direct delivery |
| IMD RIMES Unit (IRU) | Development and maintenance team | Repository |
| IMD Regional Training Institutes | Training material | Electronic copy |
| IMD Meteorological Centres | Reference for MC-level users | iRAINS portal |
| RIMES Secretariat | Partner awareness | Shared drive |

---

## **U.4 Acknowledgements**

The iRAINS platform and this technical documentation were developed under the IMD RIMES Unit (IRU), a collaborative initiative between the India Meteorological Department and the Regional Integrated Multi-Hazard Early Warning System (RIMES). The development team acknowledges the contributions of:

- The IMD Hydromet Division for operational requirements, data standards, and user acceptance testing
- IMD Regional Meteorological Centres for field testing and feedback on the data entry and verification workflows
- The RIMES Technical Division for development oversight and review
- IMD's forecast verification team for providing the QPF verification data and methodology inputs incorporated in this documentation

---

# ***Appendix V: iRAINS Operational Calendar*** {#appendix-v .unnumbered}

This appendix provides a month-by-month operational calendar describing the primary iRAINS activities throughout the year. It supports operational planning and helps new users understand when each module is most actively used.

---

## **V.1 Monthly Operational Activity Guide**

| Month | Season | Primary iRAINS Activities | Most Active Modules |
|---|---|---|---|
| **January** | Winter | Monitor western disturbance rainfall over North India; weekly departure reporting; station data entry for fog-affected stations | Rainfall Map, Rainfall Statistics, Data Entry |
| **February** | Winter | End-of-winter departure summary; check pre-monsoon data completeness; monthly report generation | Rainfall Reports, Rainfall Departures, Verification HQ |
| **March** | Pre-Monsoon | Pre-monsoon thunderstorm activity begins; track spatial distribution of convective rainfall over NE India | Spatial Distribution, Significant Rainfall, Data Entry |
| **April** | Pre-Monsoon | Nor'westers (Kalbaishakhi) over East India; elevated significant rainfall events; station performance review | Significant Rainfall, Station Statistics, Verification MC |
| **May** | Pre-Monsoon | Monsoon onset monitoring begins; Kerala onset watch after 10th May; heat wave monitoring; pre-monsoon rainfall statistics | NWP Rainfall Products, Monsoon Activity, Rainfall Statistics |
| **June** | SW Monsoon begins | Official monsoon onset over Kerala (~June 1); daily rainfall maps critical; active monitoring of monsoon advance | Rainfall Map, Dashboard, Monsoon Activity, Spatial Distribution |
| **July** | SW Monsoon peak | Peak monsoon activity; depressions form in Bay of Bengal; highest data entry and verification load; heavy rainfall events routine | All modules — peak activity; Verification HQ, Significant Rainfall most critical |
| **August** | SW Monsoon peak | Mid-season departure assessment; break monsoon detection; monsoon activity maps central to daily briefings | Monsoon Activity, Rainfall Departures, Dashboard, NWP Products |
| **September** | SW Monsoon withdrawal | Monsoon withdrawal begins from NW India after Sept 1; season-to-date cumulative departure tracking; end-of-season outlook | Rainfall Departures, Rainfall Graphs, Monsoon Activity, QPF Verification |
| **October** | Post-Monsoon / NE Monsoon | NE Monsoon onset over South India; Bay of Bengal cyclone season peak; post-monsoon departure reporting for North India | Rainfall Map, Spatial Distribution, Significant Rainfall |
| **November** | NE Monsoon | NE Monsoon active over Tamil Nadu and coastal AP; intense cyclone rainfall events possible; annual data completeness review | Significant Rainfall, Verification HQ, Station Statistics |
| **December** | Post-Monsoon | End-of-year data submission; annual station statistics export; annual report generation; data archival | Yearly Station Statistics, Rainfall Reports, Log Info |

---

## **V.2 Key Annual Milestones for iRAINS Operations**

| Date | Event | iRAINS Action Required |
|---|---|---|
| January 1 | New calendar year begins | Reset seasonal aggregation baselines; verify all stations marked active for the new year |
| March 1 | Pre-Monsoon season begins | Confirm Pre-Monsoon normal tables are loaded for the new year |
| After May 10 | Onset watch period begins | Check NWP Products daily for monsoon advance signals; monitor Kerala station network |
| ~June 1 | SW Monsoon onset over Kerala | Increase data verification frequency; activate all-station monitoring mode |
| July 1 | Month 2 of monsoon | Mid-point review — check data completeness stats for all centres via Verification HQ |
| July–August | Depression season peak | Activate significant rainfall monitoring; ensure FMO contacts are set up in Dissemination |
| September 1 | Withdrawal watch begins | Begin monitoring NW India spatial distribution for withdrawal signatures |
| October 31 | SW Monsoon season ends | Generate end-of-season departure report at all levels; archive season data |
| November–December | Annual close-out | Run yearly station statistics exports; verify no missing data gaps; generate annual climatological summary |
| December 31 | Year end | Final data quality sweep; export complete year's station data; prepare annual report |

---

## **V.3 Seasonal Reporting Deliverables**

The following table lists the standard reports generated using iRAINS across the seasonal cycle:

| Deliverable | Frequency | Primary Section | Recipient |
|---|---|---|---|
| Daily Rainfall Departure Map (subdivision level) | Daily | Rainfall Map | DG Office, Media, NDMA |
| Daily Station Significant Rainfall Summary | Daily (when applicable) | Significant Rainfall | DG Office, FMOs |
| Weekly Departure Table | Weekly (every Wednesday) | Rainfall Departures | Operational Meteorology Division |
| Monsoon Activity Classification Map | Daily | Monsoon Activity | DG Office, Regional centres |
| Monthly Climatological Summary | Monthly | Rainfall Reports | IMD Library, National Data Centre |
| Season-to-Date Cumulative Departure Report | Monthly during season | Rainfall Departures | Senior management, Ministry of Earth Sciences |
| QPF Verification Report | Seasonal (after each season) | QPF Verification Report | IMD Training & Research Division |
| Annual Station Rainfall Matrix | Annually (December) | Yearly Station Statistics | National Data Centre, Research teams |
| Annual Climatological Summary PDF | Annually (January) | Rainfall Reports | IMD Annual Climate Report |

---

# ***Appendix W: iRAINS Security and Access Control Reference*** {#appendix-w .unnumbered}

This appendix documents the security model, authentication flow, and access control rules implemented in iRAINS.

---

## **W.1 Authentication Mechanism**

iRAINS uses JSON Web Token (JWT) based authentication. The authentication flow is:

| Step | Description |
|---|---|
| 1. User submits credentials | Username and password entered on the login page and sent via HTTPS POST to `/api/v1/login` |
| 2. Server validates credentials | The backend queries the `login` table, compares the submitted password against the bcrypt hash using `bcrypt.compare()` |
| 3. Token issued | On successful validation, the server generates a JWT signed with the application's secret key. The token payload contains: `username`, `role`, `centre_code`, `exp` (expiration time) |
| 4. Token stored client-side | The Angular frontend stores the token in `localStorage` under the key `auth_token` |
| 5. Authenticated requests | Every subsequent API request includes the token in the `Authorization: Bearer <token>` header |
| 6. Server validates token | The Express middleware verifies the JWT signature on every protected endpoint. If the token is expired or invalid, a 401 Unauthorized response is returned |
| 7. Session expiry | Tokens expire after 8 hours of inactivity. The user is automatically redirected to the login page when a 401 response is received |

---

## **W.2 Role-Based Access Control (RBAC) Summary**

| Permission | HQ | MC | RMC | SP / Guest |
|---|---|---|---|---|
| View all maps and statistical modules | ✓ | ✓ | ✓ | ✓ |
| Download PDF and Excel exports | ✓ | ✓ | ✓ | Limited |
| Enter rainfall data (own centre only) | ✓ | ✓ | ✓ | — |
| Enter rainfall data (all centres) | ✓ | — | — | — |
| Enter data beyond 60-day window | ✓ | — | — | — |
| Bulk upload Excel data | ✓ | ✓ | ✓ | — |
| Verify station data (own centre) | ✓ | ✓ | ✓ | — |
| Verify station data (all centres) | ✓ | — | — | — |
| Add / edit / delete stations | ✓ | — | — | — |
| Access national Verification HQ view | ✓ | — | — | — |
| Send dissemination emails | ✓ | ✓ | ✓ | — |
| Manage recipient groups | ✓ | ✓ | — | — |
| View Log Info | ✓ | ✓ | — | — |
| Manage user accounts | ✓ | — | — | — |
| Configure Auto Email | ✓ | — | — | — |

---

## **W.3 Data Isolation for MC/RMC Users**

MC and RMC users operate with data isolation enforced at the API level. The backend extracts the `centre_code` from the validated JWT token and uses it as a filter in all queries that should return only the user's own centre's data:

- Data Entry: Station filter defaults to the user's assigned centre. The MC cannot see or edit stations assigned to other centres.
- Verification MC: Only stations assigned to the user's centre are returned.
- Yearly Station Statistics: Multi-centre selection is disabled; the export is pre-filtered to the user's centre.
- The 60-day entry window is enforced server-side: the backend rejects any save request for a date more than 60 days before the current date if the requesting user is not an HQ user.

These controls are enforced in the backend controllers and cannot be bypassed through frontend manipulation.

---

## **W.4 Password Security Policy**

| Requirement | Policy |
|---|---|
| Storage | Passwords stored as bcrypt hash (cost factor 10); never in plain text |
| Minimum length | 8 characters (recommended; enforced at application level) |
| Password reset | Performed by HQ administrator directly in the `login` table |
| First login | New users should change their assigned initial password immediately |
| Account lockout | Not implemented in current version; planned for future release |
| Session timeout | 8 hours after last authenticated request |

---

# ***Appendix X: Data Backup and Recovery Procedures*** {#appendix-x .unnumbered}

This appendix describes procedures for ensuring data integrity and recovering from system failures in iRAINS.

---

## **X.1 Critical Data Assets**

The following data assets must be protected with regular backups:

| Data Asset | Storage Location | Backup Priority | Recovery Impact if Lost |
|---|---|---|---|
| `station_daily_data_updates` | PostgreSQL database | **Critical** | Loss of all operational rainfall observations; cannot be reconstructed without centre-level records |
| `station_details` | PostgreSQL database | **Critical** | Loss of station registry; all station codes become unmapped |
| `normal_*` tables | PostgreSQL database | **High** | Loss of all normal rainfall reference values; departure calculations not possible |
| `login` table | PostgreSQL database | **High** | Loss of all user accounts; all users locked out |
| `data_actions` audit table | PostgreSQL database | **Medium** | Loss of audit trail only; operational data unaffected |
| NWP forecast images | File system | **Low** | Historical forecast images unavailable; new runs will continue to be ingested |
| Application code | Git repository | **Critical** | Required to restore application after server failure |

---

## **X.2 Recommended Backup Schedule**

| Backup Type | Frequency | Tool / Method | Retention |
|---|---|---|---|
| Full PostgreSQL dump (pg_dump) | Daily at 02:00 IST (off-peak) | `pg_dump -Fc irains_db > irains_backup_$(date +%Y%m%d).dump` | 30 days on local server |
| Incremental WAL archive | Continuous | PostgreSQL WAL archiving to secondary storage | 7 days |
| NWP image directory backup | Weekly | rsync to backup server | 3 months |
| Application configuration backup | On every configuration change | Manual copy to secure location | Indefinitely |
| Annual full backup | December 31 | Full pg_dump + application backup | Permanent archive |

---

## **X.3 Recovery Procedures**

**Scenario: Database corruption or accidental data deletion**

1. Stop the iRAINS application server immediately to prevent further data writes.
2. Identify the most recent clean backup using the backup timestamp.
3. Restore the database from the pg_dump backup file: `pg_restore -d irains_db irains_backup_YYYYMMDD.dump`
4. If the corruption occurred after the last backup, use WAL archive replay to recover up to the point of failure.
5. Restart the application and verify data integrity by checking recent station entries in the Verification HQ section.
6. Inform all MC users of the data recovery and request resubmission of any observations entered after the last backup timestamp.

**Scenario: Accidental station deletion**

1. Open Log Info → Station Log to identify the exact timestamp and username of the DELETE action.
2. Retrieve the station's previous metadata from the Previous Values field in the Station Log.
3. Re-create the station in Station Management using the recovered metadata.
4. Any data entries made for the station after deletion would have failed (no matching station code); contact the affected centre to resubmit those entries.

**Scenario: Server hardware failure**

1. Restore the PostgreSQL database on the replacement server from the most recent backup.
2. Deploy the application code from the Git repository.
3. Restore the `.env` configuration file from the secure configuration backup.
4. Update DNS or load balancer configuration to point to the new server.
5. Test login and basic data retrieval before notifying users that the system is restored.

---

## **X.4 Data Consistency Checks After Recovery**

After any recovery operation, the following consistency checks should be performed before reopening the system to users:

| Check | Method | Expected Result |
|---|---|---|
| Station count | Query `SELECT COUNT(*) FROM station_details WHERE is_active = true` | Count should match the pre-failure station registry count |
| Recent data entries | Query `station_daily_data_updates` for the last 7 days | Record count should match expected submission volumes |
| Normal tables | Spot-check several district/subdivision/state normal values for key dates | Values should match published IMD normals |
| Login access | Test login with HQ account and one MC account | Both should authenticate successfully |
| Aggregation pipeline | Load Rainfall Map for yesterday's date | Map should render with expected departure colours |

---

# ***Appendix Y: Contact and Escalation Reference*** {#appendix-y .unnumbered}

This appendix provides guidance on escalation paths for technical and operational issues with iRAINS.

---

## **Y.1 Issue Escalation Matrix**

| Issue Type | First Contact | Second Contact | Third Contact |
|---|---|---|---|
| Cannot log in | HQ system administrator | IRU technical team | IMD IT Division |
| Data entry error (own centre) | MC supervisor | HQ meteorologist | IRU technical team |
| Incorrect station metadata | HQ administrator | IRU technical team | — |
| Map not rendering | Browser troubleshooting (Appendix O) | HQ administrator | IRU technical team |
| Missing NWP products | IMD modelling team | HQ administrator | IRU technical team |
| Server downtime | HQ administrator | IRU technical team | IMD IT Division |
| Data recovery needed | HQ administrator + IRU technical team | IMD IT Division | — |
| Report for past date incorrect | HQ data manager | Verify source data in Data Entry / Verification HQ | IRU technical team if system issue |

---

## **Y.2 IRU Contact Points**

Issues with the iRAINS application (bugs, unexpected behaviour, feature requests) should be directed to the IMD RIMES Unit (IRU) technical team. When reporting a technical issue, include the following information to ensure rapid resolution:

| Information | Why Needed |
|---|---|
| Your username and role | Determines what data and features you have access to |
| The section of iRAINS where the issue occurred | Narrows the investigation to the relevant module |
| The exact date and time the issue was observed | Helps correlate with server logs |
| The geographic level and date range selected | Reproduces the query that triggered the issue |
| A screenshot of the error message or unexpected behaviour | Essential for diagnosing UI-side issues |
| Whether the issue is reproducible consistently or occurred once | Distinguishes transient from systematic failures |

---

# ***Appendix Z: iRAINS at a Glance — Executive Summary*** {#appendix-z .unnumbered}

This appendix provides a concise one-page executive summary of the iRAINS system for senior management and stakeholder briefings.

---

## **What is iRAINS?**

iRAINS (IMD Rainfall Information System) is a web-based national rainfall data management and monitoring platform developed by the IMD RIMES Unit (IRU) for IMD's Hydromet Division. It centralises the collection, verification, aggregation, and dissemination of daily rainfall observations from over 3,500 meteorological stations across India.

## **What problem does it solve?**

Before iRAINS, daily rainfall data was managed in fragmented spreadsheets and manual reports across 35 Meteorological Centres. Data quality was inconsistent, aggregation was error-prone, and operational forecasters had no real-time access to national departure analysis. iRAINS replaces this fragmented workflow with a single integrated platform accessible from any browser, with real-time data visibility and one-click report generation.

## **Who uses it?**

| User Group | Count | Primary Role in iRAINS |
|---|---|---|
| HQ Meteorologists | ~15 users | National oversight, verification, reporting, dissemination |
| MC/RMC Data Managers | ~70 users | Daily data entry and centre-level verification |
| SP (Special Profile) users | ~20 users | Read-only monitoring and analysis |
| Guest viewers | Unlimited | Public or external stakeholder map access |

## **Key Capabilities**

| Capability | Description |
|---|---|
| **Daily data collection** | Station-level rainfall entry for ~3,500 stations across India; bulk upload support; 60-day correction window |
| **Two-stage verification** | MC centre-level verification followed by HQ national verification with full audit trail |
| **National aggregation** | Weighted-average pipeline computes district → state → subdivision → region → country rainfall automatically |
| **Departure analysis** | Seven-category classification (Large Excess to No Data) at all geographic levels |
| **Monsoon monitoring** | Daily Monsoon Activity classification (Weak to Vigorous) based on rainfall ratio |
| **Spatial distribution** | Percentage of active stations reporting rain; five categories from Dry to Widespread |
| **NWP guidance** | Eight operational NWP model forecast maps (D+1 to D+7) for Meteorological Centre and River Basin views |
| **PDF and Excel reports** | One-click generation of departure reports at any geographic level and time period |
| **Email dissemination** | Structured recipient groups; automated daily bulletins; full send log |
| **Audit and governance** | Complete action log of all data entry, verification, and report generation activities |

## **Data Update Cycle**

- **11:30 IST**: First daily data aggregation — all visualization modules show current day's data for the first time
- **Every 30 minutes** after 11:30 IST: Progressive refresh incorporating late submissions
- **07:50 UTC (13:20 IST)**: Data snapshot for auto-generated official reports

## **Technology Stack**

Angular 16 (frontend) · Node.js + Express (backend) · PostgreSQL (database) · Leaflet.js (maps) · Highcharts (charts) · JWT authentication · jsPDF + xlsx-js-style (exports) · Nodemailer (email)

## **Scale**

- ~3,500 active meteorological stations monitored daily
- 36 meteorological subdivisions with departure analysis
- 700+ districts with individual departure tracking
- 366 calendar dates × 5 geographic levels of pre-stored normal rainfall values
- Data retained from 1700 onwards for historical analysis

---

## **Z.1 Summary of Document Contents**

This technical document covers the following areas of the iRAINS system:

| Section | Coverage |
|---|---|
| Sections 1–18 (Main body) | Complete functional documentation of all 18 iRAINS modules including purpose, features, sub-modules, data integration, backend architecture, threshold computation, programming environment, API generation, and user access roles |
| Appendix A–E | Introduction, system architecture, iRAINS Detailed Module Reference, iRAINS Operational Workflows, and Appendix E content |
| Appendix F | Frequently Asked Questions |
| Appendix G | Technical Specifications and System Configuration (including data refresh schedule G.5a) |
| Appendix H | Calculation Formula Reference — all aggregation and departure formulas in table format |
| Appendix I | Data Quality Framework |
| Appendix J | Integration Architecture and External Interfaces |
| Appendix K | System Design Principles and Architecture Rationale |
| Appendix L | User Training Guide |
| Appendix M | Normal Rainfall Tables Reference |
| Appendix N | Glossary of Terms |
| Appendix O | Troubleshooting Guide |
| Appendix P | Quick Reference Card for Daily Operational Use |
| Appendix Q | Station Network and Data Coverage |
| Appendix R | NWP Model Reference |
| Appendix S | Data Flow Diagram Reference |
| Appendix T | IMD Geographic Reference |
| Appendix U | Document Revision History |
| Appendix V | Operational Calendar |
| Appendix W | Security and Access Control Reference |
| Appendix X | Data Backup and Recovery Procedures |
| Appendix Y | Contact and Escalation Reference |
| Appendix Z | Executive Summary (this appendix) |

---

*End of iRAINS Technical Documentation*

*Document prepared by: IMD RIMES Unit (IRU)*
*India Meteorological Department, Hydromet Division*
*Version 2.0 — 2025*

---

## **Z.2 Key Performance Indicators for iRAINS Operations**

The following KPIs are recommended for the HQ administrator to track the operational effectiveness of iRAINS on a monthly basis:

| KPI | Definition | Target | How to Measure |
|---|---|---|---|
| Daily data submission rate | % of active stations submitting data each day | ≥ 95% | Verification HQ — Pending count / Total active stations |
| Daily verification completion rate | % of submitted data verified by HQ by end of working day | ≥ 90% | Verification HQ — Verified / Updated for each date |
| Average submission time | Average clock time of the last DATA_SAVE action per centre | ≤ 10:30 IST | Action Log — timestamp of last DATA_SAVE per centre per day |
| Email delivery success rate | % of outgoing emails with Status = SENT | ≥ 99% | Email Log — SENT / (SENT + FAILED) |
| Missing station rate | % of active stations with more than 5 consecutive ND days in a month | ≤ 2% | Yearly Station Statistics export — count ND-only rows |
| Report generation success rate | % of PDF reports generated without error | ≥ 99% | Action Log — REPORT_GENERATE events; manual review of error cases |
| NWP product availability rate | % of days where all 8 model products are available by 15:00 IST | ≥ 90% | NWP Products section — check daily product availability |

These KPIs should be reviewed monthly by the IMD RIMES Unit and Hydromet Division to identify systemic operational issues and prioritise system improvements.

---

## **Z.3 iRAINS System Roadmap (Planned Enhancements)**

The following enhancements are on the planned development roadmap for future iRAINS versions:

| Enhancement | Description | Priority | Target Version |
|---|---|---|---|
| AWS automatic ingest pipeline | Automated daily ingestion of AWS station data from IMD's central AWS server, eliminating manual AWS entry | High | 2.1 |
| HTTPS enforcement | Force all connections over HTTPS with an SSL certificate; redirect HTTP to HTTPS | High | 2.1 |
| Account lockout after failed logins | Security improvement — lock account after 5 failed login attempts within 10 minutes | High | 2.1 |
| Pagination in Log Info | Enable pagination and search in Station Log and Action Log beyond the current 50-record limit | Medium | 2.1 |
| API endpoint documentation (Swagger) | Generate and publish Swagger UI documentation for all API endpoints | Medium | 2.2 |
| Docker containerization | Package the application in Docker containers for consistent deployment across environments | Medium | 2.2 |
| Mobile-responsive design | Adapt the interface for tablet and mobile screen sizes for field use | Low | 2.3 |
| Block-level normal rainfall tables | Add pre-stored normal rainfall values at the block level for block-level departure analysis | Medium | 2.2 |
| Real-time station data feed | Display station-level rainfall values updating in near-real-time on the Station Statistics map (currently updates every 30 minutes) | Low | 2.3 |
| Multi-language interface | Add Hindi language option for the user interface | Low | 3.0 |

---

## **Z.4 Dependencies and Third-Party Licences**

iRAINS integrates several open-source libraries. The following table lists the key dependencies and their licences for compliance reference:

| Library | Version | Licence | Use in iRAINS |
|---|---|---|---|
| Angular | 16.x | MIT | Frontend framework |
| Node.js | 18.x LTS | MIT | Backend runtime |
| Express | 4.x | MIT | Backend web framework |
| PostgreSQL | 14+ | PostgreSQL Licence (open source) | Database |
| Leaflet.js | 1.9.x | BSD 2-Clause | Interactive maps |
| Leaflet-Draw | 1.x | MIT | Polygon drawing tool |
| Highcharts | 10.x | Proprietary (commercial licence required) | Charts and graphs |
| Angular-Highcharts | 10.x | MIT (wrapper only) | Highcharts Angular binding |
| PrimeNG | 16.x | MIT | UI components |
| Angular Material | 16.x | MIT | UI components |
| jsPDF | 2.x | MIT | Client-side PDF generation |
| xlsx-js-style | 1.x | Apache 2.0 | Styled Excel export |
| html-to-image | 1.x | MIT | Map canvas to image capture |
| Nodemailer | 6.x | MIT | Email dispatch |
| Moment.js | 2.x | MIT | Date manipulation |
| @turf/turf | 6.x | MIT | Geospatial analysis (polygon selection) |
| bcrypt | 5.x | MIT | Password hashing |
| jsonwebtoken | 9.x | MIT | JWT authentication |
| dotenv | 16.x | BSD 2-Clause | Environment configuration |
| pg (node-postgres) | 8.x | MIT | PostgreSQL client for Node.js |

**Note:** Highcharts requires a commercial licence for government/commercial use. The IMD RIMES Unit holds the appropriate licence for deployment within IMD's operational environment. Any redistribution or redeployment of the iRAINS application outside of IMD must include a valid Highcharts licence.

---

*This document represents the complete technical specification and operational reference for iRAINS Version 2.0.*
*Total modules documented: 18. Total appendices: A through Z (26 appendices).*
*All formulas, thresholds, classifications, and operational procedures are aligned with IMD official standards as of the document preparation date.*

---

## **Z.5 Version 2.0 Content Coverage Summary**

This Version 2.0 document provides the most comprehensive technical and operational reference ever produced for the iRAINS platform. The following table summarises the content coverage achieved:

| Coverage Area | Content | Completeness |
|---|---|---|
| Module documentation (18 modules) | Purpose, Features, Sub-Modules, Data Integration, Thresholds, Backend Architecture, DB Connection, Programming Environment, API Generation, User Access | Complete for all 18 modules |
| Calculation formulas | All aggregation levels (Station → District → State/Subdivision → Region → Country), Departure formula, Monsoon Activity ratio, Spatial Distribution percentage, QPF verification scores | Complete — Appendix H |
| Operational procedures | Daily data entry cycle, verification workflow, monsoon monitoring, report dissemination, station management, seasonal analysis, NWP forecast support | Complete — Appendix E and section-level SOP tables |
| User training | Six training modules for HQ, MC, Data Manager, Operational Meteorologist, Research user, System Administrator | Complete — Appendix L |
| Technical specifications | Server requirements, software versions, configuration parameters, database maintenance, NWP ingestion, email configuration, user management, performance tuning | Complete — Appendix G |
| Data refresh schedule | Daily 11:30 IST initial aggregation, half-hourly refresh cycle, 07:50 UTC report cut-off | Added — Appendix G.5a and Section 1 Introduction |
| Glossary | 50+ meteorological, statistical, technical, and organizational terms | Complete — Appendix N |
| Troubleshooting | 35+ common issues across 7 functional areas | Complete — Appendix O |
| Quick reference | Daily schedule, departure categories, monsoon activity, spatial distribution, intensity classification, season boundaries, module selection guide, role capabilities | Complete — Appendix P |
| Station network | Station types, code structure, national coverage, data completeness, sentinel value policy | Complete — Appendix Q |
| NWP model reference | 8 models, technical specs, availability times, PQPF thresholds, selection guidance, limitations | Complete — Appendix R |
| Data flow diagrams | Observation, normal rainfall, verification, report generation, email dissemination flows | Complete — Appendix S |
| Geographic reference | Regions, MCs, standard weeks, river basins, special districts | Complete — Appendix T |
| Security model | Authentication, RBAC, data isolation, password policy | Complete — Appendix W |
| Backup and recovery | Critical assets, backup schedule, recovery procedures, consistency checks | Complete — Appendix X |
| Operational calendar | Month-by-month activities, annual milestones, seasonal reporting deliverables | Complete — Appendix V |
| Third-party licences | All 20 key dependencies with versions and licence types | Complete — Appendix Z.4 |

---

## **Z.6 Document Metrics**

| Metric | Value |
|---|---|
| Total document length | ~10,000 lines |
| Main body sections (modules) | 18 |
| Appendices | 26 (A through Z) |
| Tables | 89 numbered tables |
| Figures (placeholders) | 50 figure placeholders |
| Glossary entries | 55+ terms defined |
| Troubleshooting scenarios | 35+ |
| Formula tables | 12 aggregation and classification formula groups |
| Training modules | 6 user-profile training modules |
| Workflow descriptions | 8 end-to-end operational workflows |
| NWP models documented | 8 operational models |
| Geographic levels supported | 5 (Station, District, State/Subdivision, Region, Country) |
| Departure categories | 7 (LE, E, N, D, LD, NR, ND) |
| Monsoon activity categories | 5 (Vigorous, Active, Normal, Weak, Subdued) |
| Spatial distribution categories | 5 (Dry, Isolated, Scattered, Fairly Widespread, Widespread) |

---

*iRAINS Technical Documentation — Version 2.0*
*© 2025 IMD RIMES Unit (IRU), India Meteorological Department*
*For technical support: Contact the IRU technical team (see Appendix Y)*

---

## **Z.7 Final Notes for Document Users**

This document is a living reference. As iRAINS evolves through new versions and as IMD's operational requirements change, sections of this document will be updated to reflect new features, revised workflows, and updated thresholds. Users should always verify that they are reading the most recent version of the document (see Appendix U for the revision history).

For users new to iRAINS, the recommended reading path is:
1. **Executive Summary** (this section, Appendix Z) — 5-minute overview of what iRAINS does
2. **Section 1: Introduction** and **iRAINS System Architecture** — understand the system context
3. **Appendix P: Quick Reference Card** — immediately useful for daily operations
4. **The specific module sections** for the modules relevant to your role:
   - Data Entry operators: Section 3 (Data Entry), Section 14 (Verification MC)
   - HQ Meteorologists: Sections 1–2 (Rainfall Map, Dashboard), Section 13 (Verification HQ)
   - Operational forecasters: Sections 5–10 (Graphs, NWP, Statistics, Departures, Spatial Distribution, Monsoon Activity)
   - Administrators: Section 17 (Log Info), Section 18 (Dissemination), Appendices G, W, X
5. **Appendix F: FAQ** — quick answers to the most common questions
6. **Appendix L: Training Guide** — structured learning path for your specific user role

---

