/* global jQuery, document, edd_free_downloads_vars */
/*jslint newcap: true*/
jQuery(document.body).ready(function ($) {
	'use strict';

	var newModal;

	if ($('input[name="edd_options[price_id][]"]').length > 0) {
		var classes, buttonPrefix, buttonSuffix, href;

		classes = $('.edd_purchase_submit_wrapper').find('a.edd-add-to-cart').attr('class');
		classes = classes.replace('edd-add-to-cart', '');

		if (edd_free_downloads_vars.has_ajax === '1') {
			buttonPrefix = '<div class="edd-free-downloads-variable-wrapper"><button type="button" class="edd-free-downloads-variable edd-free-download ' + classes + '" data-download-id=""><span>';
			buttonSuffix = '</span></button></div>';
		} else {
			buttonPrefix = '<input type="submit" class="edd-free-downloads-variable edd-free-download ' + classes + '" name="edd_purchase_download" value="';
			buttonSuffix = '" href="' + href + '" data-download-id="" />';
		}

		$('.edd_purchase_submit_wrapper').each(function (i) {
			if ($('.edd_purchase_submit_wrapper').eq(i).find('.edd-add-to-cart').data('variable-price') === 'yes') {
				var download_id = $(this).closest('form').attr('id').replace('edd_purchase_', '');

				if (edd_free_downloads_vars.bypass_logged_in === 'true') {
					$(this).after('<a href="#" class="edd-free-downloads-direct-download-link ' + classes + '" data-download-id="' + download_id + '">' + edd_free_downloads_vars.download_label + '</a>');
				} else {
					$(this).after(buttonPrefix + edd_free_downloads_vars.download_label + buttonSuffix);
				}

				$(this).parent().find('.edd-free-downloads-variable').attr('data-download-id', download_id);

				if ($(this).prev().find('input[name="edd_options[price_id][]"]:checked').attr('data-price') === '0.00') {
					$(this).css('display', 'none');
					$(this).parent().find('.edd-free-downloads-variable-wrapper').css('display', 'block');
				} else {
					$(this).css('display', 'block');
					$(this).parent().find('.edd-free-downloads-variable-wrapper').css('display', 'none');
				}
			}
		});

		$(document.body).on('change', 'input[name="edd_options[price_id][]"]', function () {
			var total = 0;
			var checked = 0;

			$(this).closest('ul').find('input[name="edd_options[price_id][]"]').each(function () {
				if ($(this).is(':checked')) {
					total += parseFloat($(this).attr('data-price'));
					checked += 1;
				}
			});

			if (checked !== 0) {
				if (total === 0) {
					$(this).closest('.edd_download_purchase_form').find('.edd_purchase_submit_wrapper').css('display', 'none');
					$(this).closest('.edd_download_purchase_form').find('.edd-free-downloads-variable-wrapper').css('display', 'block');
				} else {
					$(this).closest('.edd_download_purchase_form').find('.edd_purchase_submit_wrapper').css('display', 'block');
					$(this).closest('.edd_download_purchase_form').find('.edd-free-downloads-variable-wrapper').css('display', 'none');
				}
			} else {
				$(this).closest('.edd_download_purchase_form').find('.edd_purchase_submit_wrapper').css('display', 'block');
				$(this).closest('.edd_download_purchase_form').find('.edd-free-downloads-variable-wrapper').css('display', 'none');
			}
		});

		$(document.body).on('click', '.edd-free-downloads-variable', function (e) {
			e.preventDefault();
		});
	}

		// Get the dialog element (with the accessor method you want)
		var dialogEl = document.getElementById( 'edd-free-downloads-modal' );

		// Get first ID element value.
		var firstDivElement = $( 'div, main' ).attr( 'id' );
		var firstIdElement  = document.getElementById( firstDivElement );

		// Instanciate a new A11yDialog module
		var dialog = new A11yDialog( dialogEl, firstIdElement );

		// Disable scroll on html element when modal is open.
		dialogEl.addEventListener( 'dialog:show', function ( event ) {
			$( 'html' ).addClass( 'edd-free-downloads-disable-scroll' );
		});

		// Remove the class when modal is closed.
		dialogEl.addEventListener( 'dialog:hide', function ( event ) {
			$( 'html' ).removeClass( 'edd-free-downloads-disable-scroll' );
		});

		$(document.body).on('click', '.edd-free-download', function (e) {
			e.preventDefault();

			var button = $(this);
			var download_id = $(this).data('download-id');
			var button_html = $(this).html();

			button.append(' <i class="edd-icon-spinner edd-icon-spin"></i>');

			// Setup the notes field
			var postData = {
				action : 'edd_free_downloads_get_notes',
				download_id: download_id
			};

			$.ajax({
				type: 'POST',
				data: postData,
				dataType: 'json',
				url: edd_free_downloads_vars.ajaxurl,
				success: function (response) {
					if (response !== null) {
						if (response.title !== '') {
							$('.edd-free-downloads-note-title strong').html(response.title);
						}

						if (response.content !== '') {
							$('.edd-free-downloads-note-content').html(response.content);
						}
					}

					button.html(button_html);
				}
			}).fail(function (data) {
				if ( window.console && window.console.log ) {
					console.log( data );
				}
			});

			// Select email field on click
			$('input[name="edd_free_download_email"]').focus();
			$('input[name="edd_free_download_email"]').select();

			$('input[name="edd_free_download_id"]').val(download_id);

			if (button.parent().parent().find('input[name="edd_options[price_id][]"]').length > 0) {
				$('input[name="edd_free_download_price_id[]"]').remove();

				button.parent().parent().find('input[name="edd_options[price_id][]"]').each(function () {
					if ($(this).prop('checked')) {
						$('.edd-free-download-submit').before('<input type="hidden" name="edd_free_download_price_id[]" value="' + $(this).val().toString() + '"/>');
					}
				});
			}
		});

		$(document.body).on('keypress', '.edd-free-download-field', function (e) {
			if (e.which === 13) {
				$('.edd-free-download-submit').click();
				return false;
			}
		});

		$(document.body).on('click', '.edd-free-download-submit', function (e) {
			var email, regex, has_error = 0;

			// Disable the submit button
			$('.edd-free-download-submit').attr('disabled', 'disabled');

			// Remove the direct download link
			if ($('.edd-free-downloads-direct-download-link').length > 0) {
				$('.edd-free-downloads-direct-download-link').fadeOut('fast', function () {
					$(this).css('display', 'none');
				});
			}

			email = $('input[name="edd_free_download_email"]');
			regex = /^((([A-Za-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([A-Za-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([A-Za-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([A-Za-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/;

			if (email.val() === '') {
				$('#edd-free-download-error-email-required').css('display', 'block');

				has_error++;
			} else {
				$('#edd-free-download-error-email-required').css('display', 'none');

				if (!regex.test(email.val())) {
					$('#edd-free-download-error-email-invalid').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-email-invalid').css('display', 'none');
				}
			}

			if (edd_free_downloads_vars.require_name === 'true') {
				var fname, lname;

				fname = $('input[name="edd_free_download_fname"]');
				lname = $('input[name="edd_free_download_lname"]');

				if (fname.val() === '') {
					$('#edd-free-download-error-fname-required').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-fname-required').css('display', 'none');
				}

				if (lname.val() === '') {
					$('#edd-free-download-error-lname-required').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-lname-required').css('display', 'none');
				}
			}

			if (edd_free_downloads_vars.user_registration === 'true') {
				var username, password, password2;

				username = $('input[name="edd_free_download_username"]');
				password = $('input[name="edd_free_download_pass"]');
				password2 = $('input[name="edd_free_download_pass2"]');

				if (username.val() === '') {
					$('#edd-free-download-error-username-required').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-username-required').css('display', 'none');
				}

				if (password.val() === '') {
					$('#edd-free-download-error-password-required').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-password-required').css('display', 'none');
				}

				if (password2.val() === '') {
					$('#edd-free-download-error-password2-required').css('display', 'block');

					has_error++;
				} else {
					$('#edd-free-download-error-password2-required').css('display', 'none');
				}

				if (password.val() !== '' && password2.val() !== '') {
					if (password.val() !== password2.val()) {
						$('#edd-free-download-error-password-unmatch').css('display', 'block');

						has_error++;
					} else {
						$('#edd-free-download-error-password-unmatch').css('display', 'none');
					}
				}
			}

			if (has_error === 0) {
				$('#edd_free_download_form').submit();
				$('.edd-free-download-submit span').html(edd_free_downloads_vars.download_loading);
				$('.edd-free-download-submit span').append('<i class="edd-icon-spinner edd-icon-spin"></i>');
				$('.edd-free-download-submit').attr('disabled', 'disabled');
				newModal.close();
			} else {
				$('.edd-free-download-errors').css('display', 'block');
				$('.edd-free-download-submit').removeAttr('disabled');
				e.preventDefault();
			}
		});

		$(document.body).on('click', '.edd-free-downloads-direct-download-link', function (e) {
			e.preventDefault();

			newModal.close();

			var price_ids = '';
			var download_id = $(this).parent().parent().find('input[name="edd_free_download_id"]').val();

			if( ! download_id ) {
				download_id = $(this).parent().parent().find('.edd-free-download').data('download-id');
			}

			if( ! download_id ) {
				download_id = $(this).data('download-id');
			}

			$(this).parent().parent().find('input[name="edd_free_download_price_id[]"]').each(function () {
				price_ids = price_ids + $(this).val() + ',';
			});

			window.location = window.location + '?edd_action=free_downloads_process_download&download_id=' + download_id + '&price_ids=' + price_ids;
		});
});
