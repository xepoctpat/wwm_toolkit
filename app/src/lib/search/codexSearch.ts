import type { Confidence, EvidenceType, VerificationStatus } from "../../data/schemas/common";
import type { QuestEntry, QuestPack } from "../../data/schemas/quest";
import type { RegionPack } from "../../data/schemas/region";
import type { SourceEntry, SourcePack } from "../../data/schemas/source";
import type { StorylinePack } from "../../data/schemas/storyline";

export type CodexDomain = "regions" | "quests" | "storylines" | "sources";
export type CodexQuestType = QuestEntry["questType"];
export type CodexSourceTier = SourceEntry["tier"];

export interface CodexSearchDocumentBase {
    id: string;
    domain: CodexDomain;
    title: string;
    summary: string;
    tags: string[];
    sourceIds: string[];
    relatedEntryIds: string[];
    regionIds: string[];
    confidence?: Confidence;
    verificationStatus?: VerificationStatus;
    evidenceType?: EvidenceType;
    verificationNotes?: string;
    sortIndex: number;
}

export interface CodexQuestDocument extends CodexSearchDocumentBase {
    domain: "quests";
    questType: CodexQuestType;
    locationHint?: string;
    storylineIds: string[];
    prerequisiteQuestIds: string[];
    followUpQuestIds: string[];
}

export interface CodexStorylineDocument extends CodexSearchDocumentBase {
    domain: "storylines";
    chapterLabel: string;
    chapterNumber?: number;
    questIds: string[];
}

export interface CodexRegionDocument extends CodexSearchDocumentBase {
    domain: "regions";
    regionOrder: number;
    requiredCharacterLevel?: number;
    unlockRequirement?: string;
    traversalSummary: string;
    subregions: string[];
    landmarkNames: string[];
    storylineIds: string[];
    progressionGateEntryIds: string[];
    questIds: string[];
    campaignQuestIds: string[];
    activityHighlights: string[];
}

export interface CodexSourceDocument extends CodexSearchDocumentBase {
    domain: "sources";
    tier: CodexSourceTier;
    url: string;
    lastReviewed: string;
}

export type CodexSearchDocument =
    | CodexRegionDocument
    | CodexQuestDocument
    | CodexStorylineDocument
    | CodexSourceDocument;

export interface CodexSearchFilters {
    domain: CodexDomain | "all";
    regionId: string | "all";
    questType: CodexQuestType | "all";
}

export interface CodexSearchOptions {
    query: string;
    filters: CodexSearchFilters;
    limit?: number;
}

export interface CodexSearchResult {
    document: CodexSearchDocument;
    score: number;
    matchedTerms: string[];
}

export interface CodexSearchFilterOptions {
    domains: CodexDomain[];
    regions: string[];
    questTypes: CodexQuestType[];
}

const DOMAIN_ORDER: Record<CodexDomain, number> = {
    regions: 0,
    quests: 1,
    storylines: 2,
    sources: 3,
};

const QUEST_TYPE_ORDER: Record<CodexQuestType, number> = {
    main: 0,
    campaign: 1,
    exploration: 2,
    "jianghu-legacy": 3,
    side: 4,
    faction: 5,
    region: 6,
    system: 7,
};

function normalizeSearchText(value: string) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function tokenizeSearchText(value: string) {
    const normalized = normalizeSearchText(value);
    return normalized.length === 0 ? [] : normalized.split(/\s+/);
}

function compareDocuments(a: CodexSearchDocument, b: CodexSearchDocument) {
    const domainDifference = DOMAIN_ORDER[a.domain] - DOMAIN_ORDER[b.domain];

    if (domainDifference !== 0) {
        return domainDifference;
    }

    if (a.domain === "storylines" && b.domain === "storylines") {
        return (a.chapterNumber ?? Number.MAX_SAFE_INTEGER) - (b.chapterNumber ?? Number.MAX_SAFE_INTEGER);
    }

    if (a.domain === "regions" && b.domain === "regions") {
        return a.regionOrder - b.regionOrder;
    }

    if (a.domain === "quests" && b.domain === "quests") {
        const questTypeDifference = QUEST_TYPE_ORDER[a.questType] - QUEST_TYPE_ORDER[b.questType];

        if (questTypeDifference !== 0) {
            return questTypeDifference;
        }
    }

    return a.sortIndex - b.sortIndex;
}

function getDocumentSearchFields(document: CodexSearchDocument) {
    const title = normalizeSearchText(document.title);
    const summary = normalizeSearchText(document.summary);
    const tags = document.tags.map(normalizeSearchText);
    const metadata = normalizeSearchText(
        [
            ...document.regionIds,
            ...(document.domain === "regions"
                ? [
                      String(document.requiredCharacterLevel ?? ""),
                      document.unlockRequirement ?? "",
                      document.traversalSummary,
                      ...document.subregions,
                      ...document.landmarkNames,
                      ...document.storylineIds,
                      ...document.progressionGateEntryIds,
                      ...document.questIds,
                      ...document.campaignQuestIds,
                      ...document.activityHighlights,
                  ]
                : []),
            ...(document.domain === "quests" ? [document.questType, document.locationHint ?? ""] : []),
            ...(document.domain === "storylines" ? [document.chapterLabel, String(document.chapterNumber ?? "")] : []),
            ...(document.domain === "sources" ? [document.tier, document.url, document.lastReviewed] : []),
            document.verificationStatus ?? "",
            document.confidence ?? "",
            document.evidenceType ?? "",
            document.verificationNotes ?? "",
        ].join(" "),
    );

    return {
        title,
        summary,
        tags,
        metadata,
    };
}

function scoreCodexDocument(document: CodexSearchDocument, normalizedQuery: string, queryTokens: string[]) {
    if (queryTokens.length === 0) {
        return { score: 1, matchedTerms: [] };
    }

    const fields = getDocumentSearchFields(document);
    let score = 0;
    const matchedTerms = new Set<string>();

    if (fields.title === normalizedQuery) {
        score += 120;
        matchedTerms.add(normalizedQuery);
    } else if (fields.title.startsWith(normalizedQuery)) {
        score += 90;
        matchedTerms.add(normalizedQuery);
    } else if (fields.title.includes(normalizedQuery)) {
        score += 75;
        matchedTerms.add(normalizedQuery);
    }

    if (fields.metadata.includes(normalizedQuery)) {
        score += 40;
        matchedTerms.add(normalizedQuery);
    }

    if (fields.summary.includes(normalizedQuery)) {
        score += 24;
        matchedTerms.add(normalizedQuery);
    }

    if (document.domain === "regions") {
        const normalizedSubregions = document.subregions.map(normalizeSearchText);
        const normalizedLandmarks = document.landmarkNames.map(normalizeSearchText);

        if (normalizedSubregions.includes(normalizedQuery)) {
            score += 70;
            matchedTerms.add(normalizedQuery);
        } else if (normalizedSubregions.some((value) => value.includes(normalizedQuery))) {
            score += 30;
            matchedTerms.add(normalizedQuery);
        }

        if (normalizedLandmarks.includes(normalizedQuery)) {
            score += 56;
            matchedTerms.add(normalizedQuery);
        } else if (normalizedLandmarks.some((value) => value.includes(normalizedQuery))) {
            score += 24;
            matchedTerms.add(normalizedQuery);
        }
    }

    for (const token of queryTokens) {
        let matchedToken = false;

        if (fields.title.includes(token)) {
            score += 24;
            matchedToken = true;
        }

        if (fields.tags.some((tag) => tag.includes(token))) {
            score += 18;
            matchedToken = true;
        }

        if (fields.metadata.includes(token)) {
            score += 14;
            matchedToken = true;
        }

        if (fields.summary.includes(token)) {
            score += 8;
            matchedToken = true;
        }

        if (matchedToken) {
            matchedTerms.add(token);
        }
    }

    if (matchedTerms.size === 0) {
        return { score: 0, matchedTerms: [] };
    }

    if (queryTokens.every((token) => matchedTerms.has(token))) {
        score += 12;
    }

    return {
        score,
        matchedTerms: [...matchedTerms],
    };
}

export function buildCodexSearchDocuments(packs: {
    regionPack: RegionPack;
    questPack: QuestPack;
    storylinePack: StorylinePack;
    sourcePack: SourcePack;
}): CodexSearchDocument[] {
    const documents: CodexSearchDocument[] = [];
    let sortIndex = 0;

    for (const region of packs.regionPack.entries) {
        documents.push({
            id: region.id,
            domain: "regions",
            title: region.title,
            summary: region.summary,
            tags: region.tags,
            sourceIds: region.sourceIds,
            relatedEntryIds: region.relatedEntryIds,
            regionIds: [region.id],
            confidence: region.confidence,
            verificationStatus: region.verificationStatus,
            evidenceType: region.evidenceType,
            verificationNotes: region.verificationNotes,
            regionOrder: region.regionOrder,
            requiredCharacterLevel: region.requiredCharacterLevel,
            unlockRequirement: region.unlockRequirement,
            traversalSummary: region.traversalSummary,
            subregions: region.subregions,
            landmarkNames: region.landmarkNames,
            storylineIds: region.storylineIds,
            progressionGateEntryIds: region.progressionGateEntryIds,
            questIds: region.questIds,
            campaignQuestIds: region.campaignQuestIds,
            activityHighlights: region.activityHighlights,
            sortIndex: sortIndex++,
        });
    }

    for (const quest of packs.questPack.entries) {
        documents.push({
            id: quest.id,
            domain: "quests",
            title: quest.title,
            summary: quest.summary,
            tags: quest.tags,
            sourceIds: quest.sourceIds,
            relatedEntryIds: quest.relatedEntryIds,
            regionIds: quest.regionIds,
            confidence: quest.confidence,
            verificationStatus: quest.verificationStatus,
            evidenceType: quest.evidenceType,
            verificationNotes: quest.verificationNotes,
            questType: quest.questType,
            locationHint: quest.locationHint,
            storylineIds: quest.storylineIds,
            prerequisiteQuestIds: quest.prerequisiteQuestIds,
            followUpQuestIds: quest.followUpQuestIds,
            sortIndex: sortIndex++,
        });
    }

    for (const storyline of packs.storylinePack.entries) {
        documents.push({
            id: storyline.id,
            domain: "storylines",
            title: storyline.title,
            summary: storyline.summary,
            tags: storyline.tags,
            sourceIds: storyline.sourceIds,
            relatedEntryIds: storyline.relatedEntryIds,
            regionIds: storyline.regionIds,
            confidence: storyline.confidence,
            verificationStatus: storyline.verificationStatus,
            evidenceType: storyline.evidenceType,
            verificationNotes: storyline.verificationNotes,
            chapterLabel: storyline.chapterLabel,
            chapterNumber: storyline.chapterNumber,
            questIds: storyline.questIds,
            sortIndex: sortIndex++,
        });
    }

    for (const source of packs.sourcePack.entries) {
        documents.push({
            id: source.id,
            domain: "sources",
            title: source.title,
            summary: source.summary,
            tags: [source.tier],
            sourceIds: [],
            relatedEntryIds: [],
            regionIds: [],
            tier: source.tier,
            url: source.url,
            lastReviewed: source.lastReviewed,
            sortIndex: sortIndex++,
        });
    }

    return documents;
}

export function getCodexFilterOptions(documents: CodexSearchDocument[]): CodexSearchFilterOptions {
    const regions = [...new Set(documents.flatMap((document) => document.regionIds))].sort((left, right) =>
        left.localeCompare(right),
    );
    const questTypes = [
        ...new Set(
            documents
                .filter((document): document is CodexQuestDocument => document.domain === "quests")
                .map((document) => document.questType),
        ),
    ].sort((left, right) => QUEST_TYPE_ORDER[left] - QUEST_TYPE_ORDER[right]);

    return {
        domains: ["regions", "quests", "storylines", "sources"],
        regions,
        questTypes,
    };
}

export function getCodexDocumentById(documents: CodexSearchDocument[], id: string | null) {
    if (!id) {
        return null;
    }

    return documents.find((document) => document.id === id) ?? null;
}

export function matchesCodexFilters(document: CodexSearchDocument, filters: CodexSearchFilters) {
    if (filters.domain !== "all" && document.domain !== filters.domain) {
        return false;
    }

    if (filters.regionId !== "all" && !document.regionIds.includes(filters.regionId)) {
        return false;
    }

    if (filters.questType !== "all") {
        return document.domain === "quests" && document.questType === filters.questType;
    }

    return true;
}

export function searchCodexDocuments(documents: CodexSearchDocument[], options: CodexSearchOptions): CodexSearchResult[] {
    const normalizedQuery = normalizeSearchText(options.query);
    const queryTokens = tokenizeSearchText(options.query);

    const results = documents
        .filter((document) => matchesCodexFilters(document, options.filters))
        .map((document) => {
            const { score, matchedTerms } = scoreCodexDocument(document, normalizedQuery, queryTokens);
            return {
                document,
                score,
                matchedTerms,
            };
        })
        .filter((result) => queryTokens.length === 0 || result.score > 0)
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            const documentDifference = compareDocuments(left.document, right.document);

            if (documentDifference !== 0) {
                return documentDifference;
            }

            return left.document.title.localeCompare(right.document.title);
        });

    return typeof options.limit === "number" ? results.slice(0, options.limit) : results;
}

export function groupCodexResultsByDomain(results: CodexSearchResult[]) {
    return ["regions", "quests", "storylines", "sources"].flatMap((domain) => {
        const domainResults = results.filter((result) => result.document.domain === domain);

        return domainResults.length === 0 ? [] : [{ domain: domain as CodexDomain, results: domainResults }];
    });
}
