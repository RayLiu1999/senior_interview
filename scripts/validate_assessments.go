// validate_assessments checks the durable links between concept articles,
// Quick Quizzes, and Hard Assessments.
//
// It intentionally validates assessment artifacts and high-importance topic
// articles rather than trying to reinterpret every legacy Markdown example in
// the repository.  This keeps the CI gate useful while allowing existing
// language/configuration snippets to remain in their own documentation.
package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

type markdownFile struct {
	rel  string
	body string
	raw  string
}

type validation struct {
	errors       []string
	linksChecked int
	topics       int
	highTopics   int
	hardTopics   int
	assessments  int
	concepts     int
	learningObjs int
}

var (
	conceptIDRE = regexp.MustCompile(`concept\.[A-Za-z0-9][A-Za-z0-9._-]*`)
	learningRE  = regexp.MustCompile(`concept\.[A-Za-z0-9][A-Za-z0-9._-]*/LO-[0-9]+`)
	localLORE   = regexp.MustCompile(`\bLO-[A-Za-z0-9][A-Za-z0-9_-]*\b`)
	numberRE    = regexp.MustCompile(`[0-9]+`)
	linkRE      = regexp.MustCompile(`\[[^\]]*\]\(([^)]*)\)`)
)

func main() {
	root, err := os.Getwd()
	if err != nil {
		fail("cannot determine repository root: %v", err)
	}
	if _, err := os.Stat(filepath.Join(root, "QUIZ")); err != nil {
		fail("run this validator from the repository root: %v", err)
	}

	files, err := loadMarkdownFiles(root)
	if err != nil {
		fail("cannot load Markdown files: %v", err)
	}
	byPath := make(map[string]markdownFile, len(files))
	for _, file := range files {
		byPath[file.rel] = file
	}

	result := validation{}
	for _, file := range files {
		result.validateLinks(root, file, byPath)
	}

	for _, file := range files {
		if isTopic(file.rel) {
			result.validateTopic(file)
		}
	}

	assessmentIDs := make(map[string]string)
	for _, file := range files {
		if isAssessment(file.rel) {
			result.validateAssessment(root, file, byPath, assessmentIDs)
		}
	}

	result.printSummary()
	if len(result.errors) > 0 {
		for _, problem := range result.errors {
			fmt.Printf("ERROR %s\n", problem)
		}
		os.Exit(1)
	}
	fmt.Println("Assessment quality validation passed.")
}

func loadMarkdownFiles(root string) ([]markdownFile, error) {
	var files []markdownFile
	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		rel, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		rel = filepath.ToSlash(rel)
		if entry.IsDir() {
			base := entry.Name()
			if base == ".git" || base == ".codex" || base == ".agents" || base == "node_modules" {
				return fs.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(strings.ToLower(entry.Name()), ".md") {
			return nil
		}
		raw, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		text := string(raw)
		files = append(files, markdownFile{rel: rel, body: withoutFences(text), raw: text})
		return nil
	})
	if err != nil {
		return nil, err
	}
	sort.Slice(files, func(i, j int) bool { return files[i].rel < files[j].rel })
	return files, nil
}

func withoutFences(text string) string {
	var builder strings.Builder
	inFence := false
	for _, line := range strings.Split(text, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "```") || strings.HasPrefix(trimmed, "~~~") {
			inFence = !inFence
			builder.WriteByte('\n')
			continue
		}
		if inFence {
			builder.WriteByte('\n')
			continue
		}
		builder.WriteString(line)
		builder.WriteByte('\n')
	}
	return builder.String()
}

func isTopic(rel string) bool {
	if !strings.HasSuffix(strings.ToLower(rel), ".md") || filepath.Base(rel) == "README.md" {
		return false
	}
	return !strings.HasPrefix(rel, "QUIZ/") && !strings.HasPrefix(rel, ".github/")
}

func isAssessment(rel string) bool {
	return strings.HasPrefix(rel, "QUIZ/Hard_Assessments/") && filepath.Base(rel) != "README.md"
}

func (v *validation) validateTopic(file markdownFile) {
	v.topics++
	difficulty, hasDifficulty := metadataNumber(file.body, "難度", "difficulty")
	importance, hasImportance := metadataNumber(file.body, "重要程度", "重要性", "importance")
	if !hasDifficulty || difficulty < 1 || difficulty > 10 {
		v.addError("%s: difficulty must be an integer from 1 to 10", file.rel)
	}
	if !hasImportance || importance < 1 || importance > 5 {
		v.addError("%s: importance must be an integer from 1 to 5", file.rel)
	}
	if importance < 4 {
		return
	}

	v.highTopics++
	hasConcept := len(conceptIDRE.FindAllString(file.body, -1)) > 0
	hasLearning := strings.Contains(strings.ToLower(file.body), "learning objective") &&
		len(localLORE.FindAllString(file.body, -1)) > 0
	hasQuick := strings.Contains(strings.ToLower(file.body), "quick quiz") || strings.Contains(file.body, "快速測驗")
	hasHard := strings.Contains(strings.ToLower(file.body), "hard assessment") || strings.Contains(file.body, "硬測驗")
	if hasHard {
		v.hardTopics++
	}
	if !hasConcept {
		v.addError("%s: importance %d requires a Concept ID", file.rel, importance)
	}
	if !hasLearning {
		v.addError("%s: importance %d requires Learning Objectives with LO-*", file.rel, importance)
	}
	if !hasQuick {
		v.addError("%s: importance %d requires a Quick Quiz mapping", file.rel, importance)
	}
	if !hasHard {
		v.addError("%s: importance %d requires a Hard Assessment mapping", file.rel, importance)
	}
}

func (v *validation) validateAssessment(root string, file markdownFile, byPath map[string]markdownFile, ids map[string]string) {
	v.assessments++
	id := metadataValue(file.body, "Assessment ID")
	if id == "" {
		v.addError("%s: missing Assessment ID", file.rel)
	} else if previous, exists := ids[id]; exists {
		v.addError("%s: duplicate Assessment ID %q (also in %s)", file.rel, id, previous)
	} else {
		ids[id] = file.rel
	}
	primary := metadataValue(file.body, "主要 Concept ID")
	if primary == "" {
		primary = metadataValue(file.body, "主要 Concept IDs")
	}
	if primary == "" {
		primary = metadataValue(file.body, "Primary Concept ID")
	}
	if primary == "" {
		primary = metadataValue(file.body, "Primary Concept IDs")
	}
	if !strings.HasPrefix(primary, "concept.") {
		v.addError("%s: missing primary Concept ID", file.rel)
	}
	if len(conceptIDRE.FindAllString(file.body, -1)) == 0 {
		v.addError("%s: no Concept ID is listed", file.rel)
	}

	learningObjects := learningObjectiveNames(file.body)
	if len(learningObjects) > 0 {
		v.learningObjs += len(learningObjects)
	} else if localObjects := localLORE.FindAllString(file.body, -1); len(localObjects) > 0 {
		// Older assessments use article-local LO-1/LO-2/LO-3 identifiers.
		// They remain valid; newer assessments use concept-qualified IDs.
		v.learningObjs += len(uniqueStrings(localObjects))
	} else {
		v.addError("%s: missing Learning Objective IDs", file.rel)
	}
	if !hasAnyHeading(file.body, "測驗目標", "核心測驗", "assessment objective") {
		v.addError("%s: missing assessment objective section", file.rel)
	}
	if !hasAnyHeading(file.body, "問題情境與限制條件", "題目情境與限制條件", "問題情境", "問題詳述", "scenario") {
		v.addError("%s: missing scenario/constraint section", file.rel)
	}
	if !hasAnyHeading(file.body, "作答要求", "對應文章與測驗 track", "題目", "candidate task", "questions") {
		v.addError("%s: missing candidate task section", file.rel)
	}
	if !hasAnyHeading(file.body, "評分規準", "評分", "rubric") {
		v.addError("%s: missing rubric section", file.rel)
	}
	if !hasAnyHeading(file.body, "參考答案與詳解", "參考答案", "reference answer") {
		v.addError("%s: missing reference answer section", file.rel)
	}
	v.validateAssessmentLinks(root, file, byPath, learningObjects)
	v.validateAssessmentFences(file)
}

func (v *validation) validateAssessmentLinks(root string, file markdownFile, byPath map[string]markdownFile, learningObjects []string) {
	linkedArticles := 0
	linkedConcepts := make(map[string]bool)
	for _, target := range markdownLinks(file.body) {
		resolved, ok := resolveLink(root, file.rel, target)
		if !ok || !strings.HasSuffix(strings.ToLower(resolved), ".md") || strings.HasPrefix(resolved, "QUIZ/") {
			continue
		}
		article, exists := byPath[resolved]
		if !exists {
			continue
		}
		linkedArticles++
		for _, concept := range conceptIDRE.FindAllString(article.body, -1) {
			linkedConcepts[concept] = true
		}
	}
	if linkedArticles == 0 {
		v.addError("%s: no linked topic article was found", file.rel)
	}
	for _, learningObject := range learningObjects {
		concept := learningObject[:strings.LastIndex(learningObject, "/LO-")]
		if !linkedConcepts[concept] {
			v.addError("%s: Learning Objective %q is not represented by a linked article", file.rel, learningObject)
		}
	}
}

func (v *validation) validateAssessmentFences(file markdownFile) {
	inFence := false
	lineNumber := 0
	for _, line := range strings.Split(file.raw, "\n") {
		lineNumber++
		trimmed := strings.TrimSpace(line)
		if !strings.HasPrefix(trimmed, "```") {
			continue
		}
		if !inFence {
			language := strings.TrimSpace(strings.TrimPrefix(trimmed, "```"))
			if fields := strings.Fields(language); len(fields) > 0 {
				lang := strings.ToLower(fields[0])
				if lang != "go" && lang != "golang" && lang != "text" && lang != "txt" && lang != "markdown" {
					v.addError("%s:%d: assessment code fence must use Go or explanatory text, got %q", file.rel, lineNumber, lang)
				}
			}
		}
		inFence = !inFence
	}
	if inFence {
		v.addError("%s: unterminated fenced code block", file.rel)
	}
}

func (v *validation) validateLinks(root string, file markdownFile, byPath map[string]markdownFile) {
	for _, target := range markdownLinks(file.body) {
		if isExternalLink(target) {
			continue
		}
		resolved, ok := resolveLink(root, file.rel, target)
		if target == "" || strings.HasPrefix(target, "#") {
			continue
		}
		v.linksChecked++
		if !ok {
			v.addError("%s: broken local Markdown link %q", file.rel, target)
			continue
		}
		if _, exists := byPath[resolved]; strings.HasSuffix(strings.ToLower(resolved), ".md") && !exists {
			v.addError("%s: linked Markdown file %q was not loaded", file.rel, target)
		}
	}
}

func markdownLinks(body string) []string {
	matches := linkRE.FindAllStringSubmatch(body, -1)
	links := make([]string, 0, len(matches))
	for _, match := range matches {
		if len(match) > 1 {
			links = append(links, strings.TrimSpace(match[1]))
		}
	}
	return links
}

func resolveLink(root, from, target string) (string, bool) {
	target = strings.TrimSpace(target)
	if target == "" || strings.HasPrefix(target, "#") {
		return "", true
	}
	if strings.HasPrefix(target, "<") {
		if end := strings.Index(target, ">"); end >= 0 {
			target = target[1:end]
		}
	} else if fields := strings.Fields(target); len(fields) > 0 {
		target = fields[0]
	}
	if hash := strings.Index(target, "#"); hash >= 0 {
		target = target[:hash]
	}
	if question := strings.Index(target, "?"); question >= 0 {
		target = target[:question]
	}
	if target == "" {
		return "", true
	}
	fromPath := filepath.Join(root, filepath.FromSlash(from))
	resolvedPath := filepath.Clean(filepath.Join(filepath.Dir(fromPath), filepath.FromSlash(target)))
	rel, err := filepath.Rel(root, resolvedPath)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "", false
	}
	if _, err := os.Stat(resolvedPath); err != nil {
		return filepath.ToSlash(rel), false
	}
	return filepath.ToSlash(rel), true
}

func isExternalLink(target string) bool {
	lower := strings.ToLower(strings.TrimSpace(target))
	return lower == "" || strings.HasPrefix(lower, "#") || strings.HasPrefix(lower, "//") ||
		strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") ||
		strings.HasPrefix(lower, "mailto:") || strings.HasPrefix(lower, "tel:") ||
		strings.HasPrefix(lower, "data:") || strings.HasPrefix(lower, "javascript:")
}

func metadataNumber(body string, labels ...string) (int, bool) {
	for _, line := range strings.Split(body, "\n") {
		normalized := strings.ReplaceAll(line, "**", "")
		normalized = strings.TrimSpace(strings.TrimLeft(normalized, "-* "))
		parts := strings.SplitN(normalized, ":", 2)
		if len(parts) != 2 {
			continue
		}
		label := strings.ToLower(strings.TrimSpace(parts[0]))
		for _, candidate := range labels {
			if label != strings.ToLower(candidate) {
				continue
			}
			match := numberRE.FindString(strings.TrimSpace(parts[1]))
			if match == "" {
				return 0, false
			}
			var value int
			_, _ = fmt.Sscanf(match, "%d", &value)
			return value, true
		}
	}
	return 0, false
}

func metadataValue(body, label string) string {
	for _, line := range strings.Split(body, "\n") {
		normalized := strings.ReplaceAll(line, "**", "")
		normalized = strings.TrimSpace(strings.TrimLeft(normalized, "-* "))
		parts := strings.SplitN(normalized, ":", 2)
		if len(parts) != 2 || !strings.EqualFold(strings.TrimSpace(parts[0]), label) {
			continue
		}
		value := strings.TrimSpace(parts[1])
		value = strings.Trim(value, "` ")
		if fields := strings.Fields(value); len(fields) > 0 {
			return strings.Trim(fields[0], "`;,，。")
		}
	}
	return ""
}

func learningObjectiveNames(body string) []string {
	found := learningRE.FindAllString(body, -1)
	return uniqueStrings(found)
}

func uniqueStrings(found []string) []string {
	unique := make(map[string]bool, len(found))
	for _, value := range found {
		unique[value] = true
	}
	result := make([]string, 0, len(unique))
	for value := range unique {
		result = append(result, value)
	}
	sort.Strings(result)
	return result
}

func hasAnyHeading(body string, candidates ...string) bool {
	for _, line := range strings.Split(body, "\n") {
		trimmed := strings.TrimSpace(line)
		if !strings.HasPrefix(trimmed, "##") {
			continue
		}
		heading := strings.ToLower(strings.TrimSpace(strings.TrimLeft(trimmed, "#")))
		for _, candidate := range candidates {
			if strings.Contains(heading, strings.ToLower(candidate)) {
				return true
			}
		}
	}
	return false
}

func (v *validation) addError(format string, args ...any) {
	v.errors = append(v.errors, fmt.Sprintf(format, args...))
}

func (v validation) printSummary() {
	fmt.Printf("Topic articles: %d (importance 4/5: %d, Hard Assessment mapped: %d)\n", v.topics, v.highTopics, v.hardTopics)
	fmt.Printf("Hard Assessments: %d (unique IDs checked)\n", v.assessments)
	fmt.Printf("Learning Objective IDs checked: %d\n", v.learningObjs)
	fmt.Printf("Local Markdown links checked: %d\n", v.linksChecked)
}

func fail(format string, args ...any) {
	fmt.Printf("ERROR "+format+"\n", args...)
	os.Exit(1)
}
