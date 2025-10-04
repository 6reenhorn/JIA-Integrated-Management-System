(defun gcd-calc (a b)
  (if (zerop b)
      a
      (gcd-calc b (mod a b))))

(defun simplify-fraction (numerator denominator)
  (let ((gcd (gcd-calc (abs numerator) (abs denominator))))
    (cons (/ numerator gcd) (/ denominator gcd))))

(defun display-fraction (num den)
  (cond
    ((>= num den)
     (let ((whole (floor num den))
           (remainder (mod num den)))
       (if (zerop remainder)
           (format nil "~d" whole)
           (format nil "~d ~d ~d" whole remainder den))))
    (t (format nil "0 ~d ~d" num den))))

(defun add-fraction (n1 d1 n2 d2)
  (let* ((result-num (+ (* n1 d2) (* n2 d1)))
         (result-den (* d1 d2))
         (simplified (simplify-fraction result-num result-den)))
    (display-fraction (car simplified) (cdr simplified))))

;; Main execution
(defun main ()
  (format t "Enter number of test cases: ")
  (finish-output)
  (let ((n (read)))
    (dotimes (i n)
      (format t "Case #~d: Enter fractions (num1 den1 num2 den2): " (1+ i))
      (finish-output)
      (let ((n1 (read))
            (d1 (read))
            (n2 (read))
            (d2 (read)))
        (format t "Case #~d: ~a~%~%" (1+ i) (add-fraction n1 d1 n2 d2))))))

;; Run the program
(main)