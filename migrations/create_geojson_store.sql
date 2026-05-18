-- GeoJSON Store Table
-- Stores all GeoJSON files as-is, mirroring the frontend assets/geojson/ folder structure.
-- Upload-ready: versioning, validation, and source tracking fields are included for future frontend uploads.
--
-- Run: psql -U postgres -d IRAINS -f migrations/create_geojson_store.sql

CREATE TABLE IF NOT EXISTS geojson_store (
    id                  SERIAL PRIMARY KEY,

    -- Mirrors frontend folder structure: root | state | subdivision | regions | mcrmcs | river_basin
    folder              VARCHAR(50)  NOT NULL,
    -- Original filename e.g. "ST_ANDHRA_PRADESH.json", "INDIA_DISTRICT.json"
    file_name           VARCHAR(255) NOT NULL,
    -- Human-readable label e.g. "Andhra Pradesh", "Kerala & Mahe"
    display_name        VARCHAR(255),

    -- The GeoJSON stored exactly as-is (entire FeatureCollection)
    geojson             JSONB        NOT NULL,
    feature_count       INT          DEFAULT 0,

    -- Bounding box computed at seed/upload time (enables fast spatial filtering later)
    bbox_minx           FLOAT,       -- west  longitude
    bbox_miny           FLOAT,       -- south latitude
    bbox_maxx           FLOAT,       -- east  longitude
    bbox_maxy           FLOAT,       -- north latitude

    -- Source tracking
    source              VARCHAR(50)  NOT NULL DEFAULT 'seed_script',
    -- 'seed_script'   → populated by scripts/seedGeojson.js
    -- 'manual_upload' → uploaded via frontend (future)

    -- For manual_upload: stores the filename the user submitted
    original_filename   VARCHAR(255),

    -- For manual_upload: links to login.id of the uploader (NULL for seed_script)
    uploaded_by         INT,

    -- Versioning: re-uploading the same file bumps version, old row is preserved
    version             INT          NOT NULL DEFAULT 1,
    -- Set is_active=FALSE to disable a file without deleting it
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    -- After a re-upload, old row's superseded_by points to the new row's id
    superseded_by       INT          REFERENCES geojson_store(id) ON DELETE SET NULL,

    -- Two-step validation workflow for manual uploads
    is_validated        BOOLEAN      NOT NULL DEFAULT FALSE,
    validated_by        INT,         -- login.id of the validator
    validated_at        TIMESTAMP,
    validation_notes    TEXT,

    -- Audit timestamps
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),

    -- Open-ended metadata for future needs e.g. {"source_agency": "IMD", "year": 2024}
    metadata            JSONB        NOT NULL DEFAULT '{}',

    CONSTRAINT uq_geojson_folder_file_version UNIQUE (folder, file_name, version)
);

-- Fast lookup by folder (only active records)
CREATE INDEX IF NOT EXISTS idx_geojson_folder
    ON geojson_store (folder)
    WHERE is_active = TRUE;

-- Fast lookup by folder + filename (the primary query pattern)
CREATE INDEX IF NOT EXISTS idx_geojson_folder_filename
    ON geojson_store (folder, file_name)
    WHERE is_active = TRUE;

-- Spatial bounding box index (for future viewport-based queries)
CREATE INDEX IF NOT EXISTS idx_geojson_bbox
    ON geojson_store (bbox_minx, bbox_miny, bbox_maxx, bbox_maxy);

-- Index on uploaded_by for admin audit queries
CREATE INDEX IF NOT EXISTS idx_geojson_uploaded_by
    ON geojson_store (uploaded_by)
    WHERE uploaded_by IS NOT NULL;
