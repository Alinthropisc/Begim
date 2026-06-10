"""Тесты генерации slug продавца: транслит RU/UZ + латиница. Без БД."""

import pytest

from services.sellers import _slugify


class TestSlugify:
    @pytest.mark.parametrize(
        "text,expected",
        [
            ("Bento Cakes", "bento-cakes"),
            ("Tortlar", "tortlar"),
            ("Begim Sweets", "begim-sweets"),
        ],
    )
    def test_latin(self, text, expected):
        assert _slugify(text) == expected

    def test_strips_diacritics(self):
        assert _slugify("Café Délice") == "cafe-delice"

    @pytest.mark.parametrize(
        "text,expected",
        [
            ("Торты", "torty"),
            ("Сладкоежка", "sladkoezhka"),
        ],
    )
    def test_cyrillic_translit(self, text, expected):
        assert _slugify(text) == expected

    def test_collapses_punct_and_spaces(self):
        assert _slugify("  Hello,   World!!  ") == "hello-world"

    def test_lowercased(self):
        assert _slugify("MixedCASE") == "mixedcase"

    def test_truncated_to_48(self):
        assert len(_slugify("a" * 100)) <= 48

    def test_only_allowed_charset(self):
        slug = _slugify("Торты & Выпечка #1")
        assert all(c.isalnum() or c == "-" for c in slug)
        assert not slug.startswith("-") and not slug.endswith("-")
