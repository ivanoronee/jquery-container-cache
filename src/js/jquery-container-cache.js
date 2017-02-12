/**
 * jQuery Container Cache plugin v0.0.1-SNAPSHOT
 *
 * Copyright (c) 2016, Ivan Orone
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
(function ($) {
    "use strict";

    $.fn.containerCache = function (opts) {
        var parent = this,
            defaults = {
                elementBindEvents: {
                    "textarea": {
                        event: "blur", damp: false
                    },
                    "input[type='checkbox']": {
                        event: "change", damp: false
                    },
                    "input[type='email']": {
                        event: "blur", damp: false
                    },
                    "input[type='number']": {
                        event: "blur", damp: false
                    },
                    "input[type='password']": {
                        event: "blur", damp: false
                    },
                    "input[type='radio']": {
                        event: "change", damp: false
                    },
                    "input[type='text']": {
                        event: "blur", damp: false
                    },
                    "select": {
                        event: "change", damp: false
                    }
                },
                storageIdentifier: $(this).attr("id"),
                resetOn: [{element: $(this).find("[type='submit']"), event: "click"}],
                dumpEvents: false //to be done for events that are triggered more often.
            },
            options = $.extend({}, defaults, opts),

            init = function () {
                if (!options.storageIdentifier || !options.storageIdentifier.trim()) {
                    console.error("Please provide a storageIdentifier for use in caching the container");
                    return;
                }

                if (sessionStorageApi.isSupported) {
                    bindUpdateCacheTrigger();
                    bindResetCacheTrigger();
                    revive();
                } else {
                    console.warn("Session storage not supported for browser. No container caching will be done");
                }
            },

            bindUpdateCacheTrigger = function () {
                $.each(options.elementBindEvents, function (elementType, eventConfig) {
                    $(parent).on(eventConfig.event, elementType, cache);
                });
            },

            cache = function () {
                var target = $(this),
                    elementName = target.attr("name"),
                    elementValue = target.val();

                if (elementName !== undefined && elementName.trim()) {
                    if (target.attr('type') === 'checkbox') {
                        var isChecked = target.is(':checked'),
                            currentStoredValues = sessionStorageApi.getElementValue(elementName);
                        if (isChecked) {
                            if (currentStoredValues && currentStoredValues.indexOf(elementValue) < 0) {
                                currentStoredValues.push(elementValue);
                                elementValue = currentStoredValues;
                            } else {
                                elementValue = [elementValue];
                            }
                        } else {
                            if (currentStoredValues && currentStoredValues.indexOf(elementValue) >= 0) {
                                currentStoredValues.splice(currentStoredValues.indexOf(elementValue), 1);
                                elementValue = currentStoredValues;
                            }
                        }
                    }
                    sessionStorageApi.setOrUpdateContainerData(elementName, elementValue);
                }
            },

            bindResetCacheTrigger = function () {
                $.each(options.resetOn, function (index, resetConfig) {
                    $(resetConfig.element).on(resetConfig.event, clearCache);
                });
            },

            clearCache = function () {
                sessionStorageApi.deleteContainerData()
            },

            revive = function () {
                var containerData = sessionStorageApi.getContainerData();
                if (containerData) {
                    $.each(containerData, function (name, elementValue) {
                        var element = $(parent).find("[name='" + name + "']");
                        switch (element.attr('type')) {
                            case 'radio':
                            case 'checkbox':
                                element.each(function (index, input) {
                                    input = $(input);
                                    var checkIfMatches = function (value) {
                                        if (input.val() === value) {
                                            input.prop('checked', true);
                                        }
                                    };

                                    if ($.isArray(elementValue)) {
                                        $.each(elementValue, function (index, value) {
                                            checkIfMatches(value);
                                        });
                                    } else {
                                        checkIfMatches(elementValue);
                                    }
                                });
                                break;
                            default:
                                element.val(elementValue);
                        }
                    })
                }
            },

            sessionStorageApi = {
                isSupported: function () {
                    return window.sessionStorage;
                },

                getContainerData: function () {
                    var itemData = sessionStorage.getItem(options.storageIdentifier);

                    return itemData ? JSON.parse(itemData) : itemData
                },

                setOrUpdateContainerData: function (elementName, elementValue) {
                    var containerData = sessionStorageApi.getContainerData();
                    if (containerData) {
                        containerData[elementName] = elementValue
                    } else {
                        containerData = {};
                        containerData[elementName] = elementValue
                    }

                    return sessionStorage.setItem(options.storageIdentifier, JSON.stringify(containerData));
                },

                getElementValue: function (elementName) {
                    var containerData = sessionStorageApi.getContainerData(),
                        elementValue;

                    if (containerData) {
                        elementValue = containerData[elementName]
                    }
                    return elementValue
                },

                deleteContainerData: function () {
                    return sessionStorage.removeItem(options.storageIdentifier);
                }
            };

        init();

        return parent;
    };
}(jQuery));